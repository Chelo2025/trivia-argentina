# utils/convertir_excel_a_json.py
import pandas as pd
import os

def convertir(nombre_archivo):
    df = pd.read_excel(f"../excel/{nombre_archivo}.xlsx")
    df.to_json(f"../data/{nombre_archivo.lower()}.json", orient="records", force_ascii=False)
    print(f"{nombre_archivo}.xlsx convertido a JSON.")

# Ejecutar
convertir("Compositores")
convertir("Cantantes")
