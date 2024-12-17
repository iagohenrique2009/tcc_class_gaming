from multiprocessing import Process
import subprocess
import os

def run_script(script_name):
    try:
        print(f"Executando {script_name}...")
        # Usa Popen para não bloquear
        process = subprocess.Popen(
            ["python", script_name],
            stdout=subprocess.PIPE,  # Redireciona a saída padrão
            stderr=subprocess.PIPE,  # Redireciona os erros
            text=True                # Decodifica como texto
        )

        # Lê e imprime a saída em tempo real
        for line in iter(process.stdout.readline, ""):
            if line:
                print(f"[{script_name}] {line.strip()}")

        # Aguarda o término e captura erros
        process.wait()
        if process.returncode != 0:
            print(f"Erro em {script_name}: {process.stderr.read().strip()}")

    except Exception as e:
        print(f"Erro ao executar {script_name}: {e}")

# Lista de scripts a serem executados
scripts = ["api/game-list.py", "api/authorization.py", "api/add-db-activities.py", "api/game.py","api/performance.py"]

if __name__ == "__main__":
    processes = []

    # Verifica se os scripts existem antes de iniciar
    for script in scripts:
        if not os.path.exists(script):
            print(f"Script não encontrado: {script}")
            continue

        # Inicia o processo
        p = Process(target=run_script, args=(script,))
        p.start()
        processes.append(p)

    # Aguarda todos os processos terminarem
    for p in processes:
        p.join()

    print("Todos os scripts foram executados.")


