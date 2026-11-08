*convert yaml dict into json dict in terminal*
python -c "import yaml,json; json.dump(yaml.safe_load(open('diemo.yaml')), open('diemo.json','w'), separators=(',',':'))"

*switch to ollama autocomplete:*
opem terminal:
# Ensure the model is downloaded
ollama pull qwen2.5-coder:1.5b

# Ensure Ollama service is active
ollama serve

Cmd+Shift+P: Continue: Select Autocomplete Model

















