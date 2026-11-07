# extract_title.py
import sys
import fitz
import json

if len(sys.argv) < 2:
    print(json.dumps({"error": "No PDF path provided"}))
    sys.exit(1)

pdf_path = sys.argv[1]
doc = fitz.open(pdf_path)
page = doc[0]

spans_data = []
for block in page.get_text("dict")["blocks"]:
    for line in block.get("lines", []):
        for span in line.get("spans", []):
            spans_data.append({
                "text": span["text"].strip(),
                "font_size": span["size"],
                "y_pos": span["bbox"][1],
            })

# Sort by font size & position
spans_data.sort(key=lambda s: (-s["font_size"], s["y_pos"]))

# Ambil kandidat pertama yang cukup panjang
title = ""
for span in spans_data:
    if len(span["text"].split()) >= 3 and len(span["text"]) >= 15:
        title = span["text"]
        break

print(json.dumps({"title": title}))
