import sys
from pathlib import Path
from unittest.mock import Mock

import pytest
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, str(Path(__file__).parent.parent))


def pytest_addoption(parser):
    parser.addoption(
        "--run-slow",
        action="store_true",
        default=False,
        help="Запустить медленные тесты с реальной моделью",
    )


def pytest_configure(config):
    config.addinivalue_line("markers", "slow: отметка медленных тестов")
    config.addinivalue_line("markers", "integration: интеграционные тесты")
    config.addinivalue_line("markers", "unit: юнит-тесты")


def pytest_collection_modifyitems(config, items):
    if config.getoption("--run-slow"):
        return

    skip_slow = pytest.mark.skip(reason="Нужен флаг --run-slow для запуска")
    for item in items:
        if "slow" in item.keywords:
            item.add_marker(skip_slow)


@pytest.fixture(autouse=True)
def reset_classifier():
    import zero_shot

    zero_shot._classifier_pipeline = None
    yield
    zero_shot._classifier_pipeline = None


@pytest.fixture
def mock_classifier():
    classifier = Mock()
    classifier.return_value = []
    return classifier


@pytest.fixture
def sample_image():
    img = Image.new("RGB", (100, 100), color="red")
    return img


@pytest.fixture
def sample_image_blue():
    img = Image.new("RGB", (100, 100), color="blue")
    return img


@pytest.fixture
def sample_image_green():
    img = Image.new("RGB", (100, 100), color="green")
    return img


@pytest.fixture
def sample_image_path(tmp_path):
    img = Image.new("RGB", (100, 100), color="blue")
    image_path = tmp_path / "test_image.jpg"
    img.save(image_path)
    return str(image_path)


@pytest.fixture
def sample_image_with_text(tmp_path):
    img = Image.new("RGB", (200, 100), color="white")
    draw = ImageDraw.Draw(img)

    try:
        draw.text((10, 40), "Test Image", fill="black")
    except Exception:
        pass

    image_path = tmp_path / "test_image_with_text.png"
    img.save(image_path)
    return str(image_path)


@pytest.fixture
def sample_grayscale_image():
    img = Image.new("L", (100, 100), color=128)
    return img


@pytest.fixture
def sample_rgba_image():
    img = Image.new("RGBA", (100, 100), color=(255, 0, 0, 128))
    return img


@pytest.fixture
def multiple_image_paths(tmp_path):
    images = {}
    colors = {
        "red": (255, 0, 0),
        "green": (0, 255, 0),
        "blue": (0, 0, 255),
        "yellow": (255, 255, 0),
    }

    for color_name, color_rgb in colors.items():
        img = Image.new("RGB", (100, 100), color=color_rgb)
        image_path = tmp_path / f"test_{color_name}.jpg"
        img.save(image_path)
        images[color_name] = str(image_path)

    return images


@pytest.fixture
def large_image(tmp_path):
    img = Image.new("RGB", (1920, 1080), color="purple")
    image_path = tmp_path / "large_test_image.jpg"
    img.save(image_path)
    return str(image_path)


@pytest.fixture
def small_image(tmp_path):
    img = Image.new("RGB", (10, 10), color="orange")
    image_path = tmp_path / "small_test_image.jpg"
    img.save(image_path)
    return str(image_path)


@pytest.fixture
def mock_classification_result():
    return [
        {"label": "cat", "score": 0.7},
        {"label": "dog", "score": 0.2},
        {"label": "other", "score": 0.1},
    ]


@pytest.fixture
def default_labels():
    import zero_shot

    return list(zero_shot._DEFAULT_OTHER_LABELS)


@pytest.fixture
def common_animal_labels():
    return ["cat", "dog", "bird", "fish", "horse", "cow", "sheep", "elephant"]


@pytest.fixture
def common_object_labels():
    return ["car", "bicycle", "tree", "building", "person", "table", "chair", "phone"]


@pytest.fixture
def unicode_labels():
    return [
        "кот",
        "собака",
        "猫",
        "犬",
        "🐱",
        "🐶",
    ]


@pytest.fixture
def real_dog_image_path():
    """Real dog photo (decrypted.png) for testing with actual images."""
    from pathlib import Path

    image_path = Path(__file__).parent.parent / "decrypted.png"
    if not image_path.exists():
        pytest.skip(f"Real dog image not found at {image_path}")
    return str(image_path)
