import cirq
import secrets
import json
import sys
import numpy as np 


def obtener_semilla_hardware():
    return secrets.randbits(32)

def generar_identidad_cuantica(n_qubits=128):
    try:
        semilla = obtener_semilla_hardware()
        simulador = cirq.Simulator(seed=semilla)

        qubits = cirq.LineQubit.range(n_qubits)

        circuito = cirq.Circuit()
        circuito.append(cirq.H.on_each(*qubits))

        circuito_muestra = cirq.Circuit(cirq.H.on_each(qubits[0], qubits[1]))
        resultado_onda = simulador.simulate(circuito_muestra)
        vector_estado = resultado_onda.final_state_vector
        muestra_onda = [f"{amp.real:.4f}{amp.imag:+.4f}j" for amp in vector_estado]

        circuito.append(cirq.measure(*qubits, key='resultado'))
        resultado = simulador.run(circuito, repetitions=1)

        mediciones = resultado.measurements['resultado'][0]
        cadena_binaria = "".join(str(int(bit)) for bit in mediciones)
        llave_hex = format(int(cadena_binaria, 2), f'0{n_qubits // 4}x')

        return {
            "status": "success",
            "quantum_key": llave_hex,
            "entropy_source": "Hardware_Randomness_Injection",
            "entropy_bits": 32,
            "wave_function_sample": muestra_onda,
            "qubit_count": n_qubits,
            "key_length_bits": n_qubits
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    sys.stdout.write(json.dumps(generar_identidad_cuantica()))
    sys.stdout.flush()