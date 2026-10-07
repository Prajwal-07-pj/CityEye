import base64
import io
import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import torch
from PIL import Image
from transformers import AutoModel, AutoProcessor


MODEL_NAME = "google/siglip-base-patch16-512"
HOST = "127.0.0.1"
PORT = int(os.getenv("CLASSIFIER_PORT", "8001"))
CATEGORIES = [
    "Road / Pothole",
    "Garbage",  
    "Electrical Hazard",
    "Streetlight",
    "Water Supply",
    "Drainage",
    "Fallen Tree",
    "Public Infrastructure",
]
TEXT_PROMPTS = [f"a photo of a {category.lower()} civic issue" for category in CATEGORIES]

print(f"Loading {MODEL_NAME}...", flush=True)
processor = AutoProcessor.from_pretrained(MODEL_NAME)
model = AutoModel.from_pretrained(MODEL_NAME)
model.eval()
print(f"Classifier listening on http://{HOST}:{PORT}", flush=True)


def classify_image(image_data: str) -> list[dict[str, float | str]]:
    _, encoded = image_data.split(",", 1)
    image = Image.open(io.BytesIO(base64.b64decode(encoded))).convert("RGB")
    inputs = processor(
        text=TEXT_PROMPTS,
        images=image,
        padding="max_length",
        return_tensors="pt",
    )
    with torch.no_grad():
        probabilities = torch.sigmoid(model(**inputs).logits_per_image[0]).tolist()
    predictions = sorted(
        (
            {"label": label, "score": float(score)}
            for label, score in zip(CATEGORIES, probabilities)
        ),
        key=lambda item: item["score"],
        reverse=True,
    )
    return predictions


class ClassifierHandler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        if self.path == "/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"ok":true}')
            return
        self.send_error(404)

    def do_POST(self) -> None:
        if self.path != "/classify":
            self.send_error(404)
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            request = json.loads(self.rfile.read(length))
            predictions = classify_image(request["image"])
            payload = json.dumps({"predictions": predictions}).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
        except (KeyError, ValueError, TypeError, base64.binascii.Error) as error:
            payload = json.dumps({"message": f"Invalid image request: {error}"}).encode("utf-8")
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
        except Exception as error:
            print(f"Classification failed: {error}", flush=True)
            self.send_error(502, "Image classification failed")

    def log_message(self, format_string: str, *args: object) -> None:
        print(f"{self.address_string()} - {format_string % args}", flush=True)


ThreadingHTTPServer((HOST, PORT), ClassifierHandler).serve_forever()
