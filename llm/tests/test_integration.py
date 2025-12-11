import sys
from pathlib import Path
from unittest.mock import patch

import pytest
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent.parent))

import zero_shot


class TestIntegrationWorkflow:
    def test_complete_classification_workflow(self, mock_classifier, sample_image_path):
        mock_classifier.return_value = [
            {"label": "photo", "score": 0.8},
            {"label": "drawing", "score": 0.15},
            {"label": "other", "score": 0.05},
        ]

        with patch("zero_shot._get_classifier", return_value=mock_classifier):
            result = zero_shot.classify_image(
                sample_image_path, ["photo", "drawing", "other"]
            )

            prob = zero_shot.probability_of(
                sample_image_path, "photo", other_labels=["drawing", "other"]
            )

        assert "photo" in result
        assert result["photo"] == 0.8
        assert prob == 0.8

    def test_multiple_images_sequential(self, mock_classifier, multiple_image_paths):
        mock_classifier.return_value = [
            {"label": "red", "score": 0.7},
            {"label": "other", "score": 0.3},
        ]

        results = {}
        with patch("zero_shot._get_classifier", return_value=mock_classifier):
            for color, path in multiple_image_paths.items():
                prob = zero_shot.probability(path, color, other_labels=["other"])
                results[color] = prob

        assert len(results) == len(multiple_image_paths)
        assert all(0.0 <= prob <= 1.0 for prob in results.values())

    def test_same_classifier_reused(self, mock_classifier, sample_image):
        mock_classifier.return_value = [
            {"label": "test", "score": 1.0},
        ]

        zero_shot._classifier_pipeline = mock_classifier

        zero_shot.classify_image(sample_image, ["test"])
        zero_shot.classify_image(sample_image, ["test"])

        assert mock_classifier.call_count == 2


class TestDifferentImageFormats:
    def test_rgb_image(self, mock_classifier, sample_image):
        mock_classifier.return_value = [{"label": "rgb", "score": 1.0}]

        with patch("zero_shot._get_classifier", return_value=mock_classifier):
            result = zero_shot.classify_image(sample_image, ["rgb"])

        assert result["rgb"] == 1.0

    def test_rgba_image(self, mock_classifier, sample_rgba_image):
        mock_classifier.return_value = [{"label": "transparent", "score": 0.9}]

        with patch("zero_shot._get_classifier", return_value=mock_classifier):
            result = zero_shot.classify_image(sample_rgba_image, ["transparent"])

        assert result["transparent"] == 0.9

    def test_grayscale_image(self, mock_classifier, sample_grayscale_image):
        mock_classifier.return_value = [{"label": "grayscale", "score": 0.95}]

        with patch("zero_shot._get_classifier", return_value=mock_classifier):
            result = zero_shot.classify_image(sample_grayscale_image, ["grayscale"])

        assert result["grayscale"] == 0.95

    def test_large_image(self, mock_classifier, large_image):
        mock_classifier.return_value = [{"label": "large", "score": 0.8}]

        with patch("zero_shot._get_classifier", return_value=mock_classifier):
            result = zero_shot.classify_image(large_image, ["large"])

        assert result["large"] == 0.8

    def test_small_image(self, mock_classifier, small_image):
        mock_classifier.return_value = [{"label": "small", "score": 0.7}]

        with patch("zero_shot._get_classifier", return_value=mock_classifier):
            result = zero_shot.classify_image(small_image, ["small"])

        assert result["small"] == 0.7


class TestRealWorldScenarios:
    def test_photo_vs_screenshot(self, mock_classifier, sample_image_path):
        mock_classifier.return_value = [
            {"label": "photo", "score": 0.85},
            {"label": "screenshot", "score": 0.15},
        ]

        with patch("zero_shot._get_classifier", return_value=mock_classifier):
            result = zero_shot.classify_image(
                sample_image_path, ["photo", "screenshot"]
            )

        assert result["photo"] > result["screenshot"]

    def test_outdoor_vs_indoor(self, mock_classifier, sample_image):
        mock_classifier.return_value = [
            {"label": "outdoor", "score": 0.7},
            {"label": "indoor", "score": 0.3},
        ]

        with patch("zero_shot._get_classifier", return_value=mock_classifier):
            result = zero_shot.classify_image(sample_image, ["outdoor", "indoor"])

        assert result["outdoor"] > result["indoor"]

    def test_food_detection(self, mock_classifier, sample_image):
        mock_classifier.return_value = [
            {"label": "food", "score": 0.6},
            {"label": "not food", "score": 0.4},
        ]

        with patch("zero_shot._get_classifier", return_value=mock_classifier):
            prob = zero_shot.probability_of(
                sample_image, "food", other_labels=["not food"]
            )

        assert 0.0 <= prob <= 1.0

    def test_day_vs_night(self, mock_classifier, sample_image):
        mock_classifier.return_value = [
            {"label": "day", "score": 0.8},
            {"label": "night", "score": 0.2},
        ]

        with patch("zero_shot._get_classifier", return_value=mock_classifier):
            result = zero_shot.classify_image(sample_image, ["day", "night"])

        assert result["day"] > result["night"]

    def test_person_detection(self, mock_classifier, sample_image):
        mock_classifier.return_value = [
            {"label": "person", "score": 0.75},
            {"label": "no person", "score": 0.25},
        ]

        with patch("zero_shot._get_classifier", return_value=mock_classifier):
            prob = zero_shot.probability_of(
                sample_image, "person", other_labels=["no person"]
            )

        assert prob == 0.75


class TestPerformance:
    def test_batch_processing_performance(self, mock_classifier, multiple_image_paths):
        mock_classifier.return_value = [
            {"label": "test", "score": 0.5},
            {"label": "other", "score": 0.5},
        ]

        with patch("zero_shot._get_classifier", return_value=mock_classifier):
            for path in multiple_image_paths.values():
                result = zero_shot.classify_image(path, ["test", "other"])
                assert isinstance(result, dict)

    def test_repeated_classification(self, mock_classifier, sample_image):
        mock_classifier.return_value = [
            {"label": "consistent", "score": 0.9},
        ]

        results = []
        with patch("zero_shot._get_classifier", return_value=mock_classifier):
            for _ in range(5):
                result = zero_shot.classify_image(sample_image, ["consistent"])
                results.append(result["consistent"])

        assert all(score == results[0] for score in results)


@pytest.mark.slow
class TestRealModelIntegration:
    def test_real_color_classification(self, sample_image):
        result = zero_shot.classify_image(
            sample_image, ["red color", "blue color", "green color"]
        )

        assert isinstance(result, dict)
        assert len(result) == 3
        assert all(0.0 <= score <= 1.0 for score in result.values())
        assert result["red color"] > 0.3

    def test_real_probability_calculation(self, sample_image_blue):
        prob = zero_shot.probability_of(
            sample_image_blue,
            "blue color",
            other_labels=["red color", "green color"],
        )

        assert isinstance(prob, float)
        assert 0.0 <= prob <= 1.0
        assert prob > 0.3

    def test_real_multiple_labels(self, sample_image):
        labels = ["color", "shape", "object", "animal", "person", "building"]
        result = zero_shot.classify_image(sample_image, labels)

        assert len(result) == len(labels)
        assert all(0.0 <= score <= 1.0 for score in result.values())

    def test_real_classifier_caching(self, sample_image, sample_image_blue):
        result1 = zero_shot.classify_image(sample_image, ["test1"])
        result2 = zero_shot.classify_image(sample_image_blue, ["test2"])

        assert isinstance(result1, dict)
        assert isinstance(result2, dict)

    def test_real_unicode_labels(self, sample_image):
        labels = ["красный цвет", "синий цвет", "зелёный цвет"]
        result = zero_shot.classify_image(sample_image, labels)

        assert len(result) == len(labels)
        assert all(0.0 <= score <= 1.0 for score in result.values())
        assert result["красный цвет"] > 0.2


class TestEdgeCasesIntegration:
    def test_very_similar_labels(self, mock_classifier, sample_image):
        mock_classifier.return_value = [
            {"label": "cat", "score": 0.51},
            {"label": "cats", "score": 0.49},
        ]

        with patch("zero_shot._get_classifier", return_value=mock_classifier):
            result = zero_shot.classify_image(sample_image, ["cat", "cats"])

        assert abs(result["cat"] - result["cats"]) < 0.1

    def test_contradictory_labels(self, mock_classifier, sample_image):
        mock_classifier.return_value = [
            {"label": "light", "score": 0.6},
            {"label": "dark", "score": 0.4},
        ]

        with patch("zero_shot._get_classifier", return_value=mock_classifier):
            result = zero_shot.classify_image(sample_image, ["light", "dark"])

        assert result["light"] != result["dark"]

    def test_empty_vs_full_labels(self, mock_classifier, sample_image):
        mock_classifier.return_value = [
            {"label": "empty", "score": 0.3},
            {"label": "full", "score": 0.7},
        ]

        with patch("zero_shot._get_classifier", return_value=mock_classifier):
            result = zero_shot.classify_image(sample_image, ["empty", "full"])

        assert sum(result.values()) > 0


@pytest.mark.slow
class TestRealDogImage:

    def test_dog_classification(self, real_dog_image_path):
        result = zero_shot.classify_image(
            real_dog_image_path, ["dog", "cat", "bird", "horse", "cow", "sheep"]
        )

        assert isinstance(result, dict)
        assert len(result) == 6
        assert all(0.0 <= score <= 1.0 for score in result.values())
        assert result["dog"] == max(result.values())
        assert result["dog"] > 0.5  

    def test_dog_probability(self, real_dog_image_path):
        prob = zero_shot.probability_of(
            real_dog_image_path, "dog", other_labels=["cat", "bird", "not animal"]
        )

        assert isinstance(prob, float)
        assert 0.0 <= prob <= 1.0
        assert prob > 0.5  

    def test_dog_vs_cat(self, real_dog_image_path):
        result = zero_shot.classify_image(real_dog_image_path, ["dog", "cat"])

        assert result["dog"] > result["cat"]
        assert result["dog"] - result["cat"] > 0.2

    def test_dog_type_classification(self, real_dog_image_path):
        result = zero_shot.classify_image(
            real_dog_image_path, ["small dog", "big dog", "puppy", "adult dog"]
        )

        assert isinstance(result, dict)
        assert len(result) == 4
        assert all(0.0 <= score <= 1.0 for score in result.values())
        assert max(result.values()) > 0.3

    def test_real_image_metadata(self, real_dog_image_path):
        from PIL import Image

        img = Image.open(real_dog_image_path)

        assert img.size[0] > 100  
        assert img.size[1] > 100  
        assert img.mode in ["RGB", "RGBA", "L"]  

    def test_animal_vs_non_animal(self, real_dog_image_path):
        result = zero_shot.classify_image(
            real_dog_image_path, ["animal", "vehicle", "building", "food", "landscape"]
        )

        assert result["animal"] == max(result.values())
        assert result["animal"] > 0.4
