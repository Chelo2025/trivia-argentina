import pandas as pd

def convertir(nombre_archivo):
    df = pd.read_excel(
        f"../excel/{nombre_archivo}.xlsx",
        sheet_name="Hoja2",
        dtype=str,  # fuerza todas las columnas como texto
        engine="openpyxl"  # asegura compatibilidad con .xlsx
    )
    
    # Limpieza opcional: eliminar espacios y normalizar nombres de columnas
    df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]

    # Exportar sin convertir fechas
    df.to_json(f"../data/{nombre_archivo.lower()}.json", orient="records", force_ascii=False)
    print(f"{nombre_archivo}.xlsx convertido correctamente a JSON.")

# Ejecutar
convertir("Compositores")
