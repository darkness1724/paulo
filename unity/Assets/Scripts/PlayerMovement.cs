using UnityEngine;

// Movimiento básico del personaje en tercera persona, con cámara que lo sigue.
// Requiere un CharacterController en el objeto del personaje.
[RequireComponent(typeof(CharacterController))]
public class PlayerMovement : MonoBehaviour
{
    public float velocidad = 3.0f;
    public float gravedad = -20f;
    public Transform camara;
    public Vector3 desplazamientoCamara = new Vector3(0f, 2.2f, -4.5f);
    public float sensibilidadGiro = 180f;

    CharacterController control;
    float velocidadVertical;
    float giroCamara;

    void Awake()
    {
        control = GetComponent<CharacterController>();
        if (camara == null && Camera.main != null) camara = Camera.main.transform;
    }

    void Update()
    {
        // Entrada: WASD o flechas. El movimiento es relativo a la cámara.
        float h = Input.GetAxisRaw("Horizontal");
        float v = Input.GetAxisRaw("Vertical");

        Vector3 frente = camara != null ? Vector3.ProjectOnPlane(camara.forward, Vector3.up).normalized : Vector3.forward;
        Vector3 derecha = camara != null ? Vector3.ProjectOnPlane(camara.right, Vector3.up).normalized : Vector3.right;
        Vector3 direccion = (frente * v + derecha * h);
        if (direccion.sqrMagnitude > 1f) direccion.Normalize();

        if (control.isGrounded && velocidadVertical < 0f) velocidadVertical = -2f;
        velocidadVertical += gravedad * Time.deltaTime;

        Vector3 movimiento = direccion * velocidad + Vector3.up * velocidadVertical;
        control.Move(movimiento * Time.deltaTime);

        // El personaje mira hacia donde se mueve.
        if (direccion.sqrMagnitude > 0.001f)
        {
            Quaternion destino = Quaternion.LookRotation(direccion);
            transform.rotation = Quaternion.Slerp(transform.rotation, destino, 12f * Time.deltaTime);
        }
    }

    void LateUpdate()
    {
        if (camara == null) return;

        // Giro de cámara con el ratón (clic derecho sostenido) o con Q y E.
        if (Input.GetMouseButton(1)) giroCamara += Input.GetAxis("Mouse X") * sensibilidadGiro * Time.deltaTime;
        if (Input.GetKey(KeyCode.Q)) giroCamara -= 90f * Time.deltaTime;
        if (Input.GetKey(KeyCode.E)) giroCamara += 90f * Time.deltaTime;

        Quaternion rotacion = Quaternion.Euler(0f, giroCamara, 0f);
        camara.position = transform.position + rotacion * desplazamientoCamara;
        camara.LookAt(transform.position + Vector3.up * 1.6f);
    }
}
