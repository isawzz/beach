*convert yaml dict into json dict in terminal*
python -c "import yaml,json; json.dump(yaml.safe_load(open('diemo.yaml')), open('diemo.json','w'), separators=(',',':'))"

*switch to ollama autocomplete:*
opem terminal:
# Ensure the model is downloaded
ollama pull qwen2.5-coder:1.5b

# Ensure Ollama service is active
ollama serve

Cmd+Shift+P: Continue: Select Autocomplete Model

*idea for icons menu*
- at the top of dMain there should be a line with search and filter functionality. it should have 1) one options (select) location, that offers entering a) emoji (that does what it is doing right now) b)a folder (or browse for folder) or c) website/url. 2) keyword input field. and a GO button: this will start a search at the location an filter by keyword (if any). for a folder, it will look at the filename and return all files containing that keyword. for a url it will just run an image search at that site. 















