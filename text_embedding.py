import sys
import json
import clip
import torch

device = "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

def get_text_embedding(text: str):
    with torch.no_grad():
        tokens = clip.tokenize([text]).to(device)
        text_features = model.encode_text(tokens)
        text_features /= text_features.norm(dim=-1, keepdim=True)
    return text_features.squeeze().tolist()

if __name__ == "__main__":
    input_text = sys.argv[1] if len(sys.argv) > 1 else ""
    embedding = get_text_embedding(input_text)
    print(json.dumps(embedding))
