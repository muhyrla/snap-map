import io
import sys
from pathlib import Path
from unittest.mock import MagicMock, Mock, patch

import pytest
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent.parent))

import zero_shot


@pytest.fixture
def mock_classifier():
    classifier = Mock()
    return classifier


@pytest.fixture
def sample_image():
    img = Image.new("RGB", (100, 100), color="red")
    return img


@pytest.fixture
def sample_image_path(tmp_path):
    img = Image.new("RGB", (100, 100), color="blue")
    image_path = tmp_path / "test_image.jpg"
    img.save(image_path)
    return str(image_path)


@pytest.fixture(autouse=True)
def reset_classifier():
    zero_shot._classifier_pipeline = None
    yield
    zero_shot._classifier_pipeline = None


class TestClassifyImage:
    def test_classify_image_returns_dict(self, mock_classifier, sample_image):
        mock_classifier.return_value = [
            {"label": "cat", "score": 0.7},
            {"label": "dog", "score": 0.3},
        ]

        with patch("zero_shot._get_classifier", return_value=mock_classifier):
            result = zero_shot.classify_image(sample_image, ["cat", "dog"])

        assert isinstance(result, dict)
        assert "cat" in result
        assert "dog" in result

    def test_classify_image_scores(self, mock_classifier, sample_image):
        mock_classifier.return_value = [
            {"label": "car", "score": 0.8},
            {"label": "bicycle", "score": 0.2},
        ]

        with patch("zero_shot._get_classifier", return_value=mock_classifier):
            result = zero_shot.classify_image(sample_image, ["car", "bicycle"])

        assert result["car"] == 0.8
        assert result["bicycle"] == 0.2

    def test_classify_image_empty_labels_raises_error(self, sample_image):
        with pytest.raises(ValueError, match="candidate_labels не должен быть пустым"):
            zero_shot.classify_image(sample_image, [])

    def test_classify_image_with_path(self, mock_classifier, sample_image_path):
        mock_classifier.return_value = [
            {"label": "photo", "score": 0.9},
            {"label": "drawing", "score": 0.1},
        ]

        with patch("zero_shot._get_classifier", return_value=mock_classifier):
            result = zero_shot.classify_image(sample_image_path, ["photo", "drawing"])

        assert result["photo"] == 0.9
        assert result["drawing"] == 0.1

    def test_classify_image_multiple_labels(self, mock_classifier, sample_image):
        labels = ["cat", "dog", "bird", "fish", "horse"]
        mock_result = [{"label": label, "score": 0.2} for label in labels]
        mock_classifier.return_value = mock_result

        with patch("zero_shot._get_classifier", return_value=mock_classifier):
            result = zero_shot.classify_image(sample_image, labels)

        assert len(result) == len(labels)
        for label in labels:
            assert label in result


class TestProbabilityOf:
    def test_probability_of_with_default_labels(self, mock_classifier, sample_image):
        expected_labels = zero_shot._DEFAULT_OTHER_LABELS + ["cat"]
        mock_result = [{"label": label, "score": 0.2} for label in expected_labels[:-1]]
        mock_result.append({"label": "cat", "score": 0.8})
        mock_classifier.return_value = mock_result

        with patch("zero_shot._get_classifier", return_value=mock_classifier):
            prob = zero_shot.probability_of(sample_image, "cat")

        assert prob == 0.8
        assert 0.0 <= prob <= 1.0

    def test_probability_of_with_custom_labels(self, mock_classifier, sample_image):
        mock_result = [
            {"label": "dog", "score": 0.3},
            {"label": "bird", "score": 0.2},
            {"label": "cat", "score": 0.5},
        ]
        mock_classifier.return_value = mock_result

        with patch("zero_shot._get_classifier", return_value=mock_classifier):
            prob = zero_shot.probability_of(
                sample_image, "cat", other_labels=["dog", "bird"]
            )

        assert prob == 0.5

    def test_probability_of_target_not_in_others(self, mock_classifier, sample_image):
        mock_result = [{"label": "dog", "score": 0.4}, {"label": "cat", "score": 0.6}]
        mock_classifier.return_value = mock_result

        with patch("zero_shot._get_classifier", return_value=mock_classifier):
            prob = zero_shot.probability_of(sample_image, "cat", other_labels=["dog"])

        assert prob == 0.6

    def test_probability_of_missing_label_returns_zero(
        self, mock_classifier, sample_image
    ):
        mock_result = [{"label": "dog", "score": 0.5}, {"label": "bird", "score": 0.5}]
        mock_classifier.return_value = mock_result

        with patch("zero_shot._get_classifier", return_value=mock_classifier):
            prob = zero_shot.probability_of(
                sample_image, "missing_label", other_labels=["dog", "bird"]
            )

        assert prob == 0.0

    def test_probability_of_with_path(self, mock_classifier, sample_image_path):
        mock_result = [
            {"label": "background", "score": 0.3},
            {"label": "landscape", "score": 0.7},
        ]
        mock_classifier.return_value = mock_result

        with patch("zero_shot._get_classifier", return_value=mock_classifier):
            prob = zero_shot.probability_of(
                sample_image_path, "landscape", other_labels=["background"]
            )

        assert prob == 0.7


class TestProbability:
    def test_probability_wrapper(self, mock_classifier, sample_image_path):
        mock_result = [
            {"label": "other", "score": 0.4},
            {"label": "portrait", "score": 0.6},
        ]
        mock_classifier.return_value = mock_result

        with patch("zero_shot._get_classifier", return_value=mock_classifier):
            prob = zero_shot.probability(
                sample_image_path, "portrait", other_labels=["other"]
            )

        assert prob == 0.6

    def test_probability_with_default_labels(self, mock_classifier, sample_image_path):
        expected_labels = zero_shot._DEFAULT_OTHER_LABELS + ["tree"]
        mock_result = [{"label": label, "score": 0.1} for label in expected_labels[:-1]]
        mock_result.append({"label": "tree", "score": 0.6})
        mock_classifier.return_value = mock_result

        with patch("zero_shot._get_classifier", return_value=mock_classifier):
            prob = zero_shot.probability(sample_image_path, "tree")

        assert prob == 0.6


class TestGetClassifier:
    @pytest.mark.slow
    def test_classifier_singleton(self):
        mock_pipeline = Mock()

        with patch(
            "transformers.pipeline", return_value=mock_pipeline
        ) as mock_pipeline_func:
            classifier1 = zero_shot._get_classifier()
            classifier2 = zero_shot._get_classifier()

        assert mock_pipeline_func.call_count == 1
        assert classifier1 is classifier2

    @pytest.mark.slow
    def test_classifier_with_custom_model(self):
        mock_pipeline_func = Mock()

        with patch("transformers.pipeline", mock_pipeline_func):
            zero_shot._get_classifier("custom/model")

        mock_pipeline_func.assert_called_once_with(
            "zero-shot-image-classification", model="custom/model"
        )


class TestIntegration:
    @pytest.mark.slow
    def test_real_classification(self, sample_image):
        result = zero_shot.classify_image(
            sample_image, ["red color", "blue color", "green color"]
        )

        assert isinstance(result, dict)
        assert len(result) == 3
        assert all(0.0 <= score <= 1.0 for score in result.values())
        assert result["red color"] > 0.3


class TestEdgeCases:
    def test_single_label(self, mock_classifier, sample_image):
        mock_classifier.return_value = [{"label": "single", "score": 1.0}]

        with patch("zero_shot._get_classifier", return_value=mock_classifier):
            result = zero_shot.classify_image(sample_image, ["single"])

        assert result["single"] == 1.0

    def test_very_long_label(self, mock_classifier, sample_image):
        long_label = "a very long label " * 10
        mock_classifier.return_value = [
            {"label": long_label, "score": 0.8},
            {"label": "short", "score": 0.2},
        ]

        with patch("zero_shot._get_classifier", return_value=mock_classifier):
            result = zero_shot.classify_image(sample_image, [long_label, "short"])

        assert long_label in result
        assert result[long_label] == 0.8

    def test_unicode_labels(self, mock_classifier, sample_image):
        labels = ["кот", "собака", "птица"]
        mock_result = [{"label": label, "score": 1.0 / len(labels)} for label in labels]
        mock_classifier.return_value = mock_result

        with patch("zero_shot._get_classifier", return_value=mock_classifier):
            result = zero_shot.classify_image(sample_image, labels)

        for label in labels:
            assert label in result


def pytest_addoption(parser):
    parser.addoption(
        "--run-slow",
        action="store_true",
        default=False,
        help="Запустить медленные тесты с реальной моделью",
    )


def pytest_configure(config):
    config.addinivalue_line("markers", "slow: отметка медленных тестов")
