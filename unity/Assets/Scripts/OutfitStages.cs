using System.Text.RegularExpressions;
using UnityEngine;

// Muestra solo las prendas de la etapa elegida.
// Las mallas se llaman igual que en Blender (Buso_Rojo, Chaqueta_Azul, ...).
// Unity puede añadir sufijos como ".001" al importar; se ignoran al comparar.
[DisallowMultipleComponent]
public class OutfitStages : MonoBehaviour
{
    [Range(1, 5)] public int etapa = 1;

    // Prendas que cambian entre etapas. Un nombre que termina en "_" coincide con todo su prefijo.
    static readonly string[] Prendas =
    {
        "Buso_Rojo", "Mangas_Rojas", "Chaqueta_Negra", "Mochila", "Correa", "Invasor_",
        "Chaqueta_Azul", "Chaqueta_Azul_Mangas", "Negro_Torso", "Negro_Mangas",
        "Traje_Suit", "Chaqueta_Punk",
    };

    // Qué prendas se ven en cada etapa.
    static readonly System.Collections.Generic.Dictionary<int, string[]> PorEtapa = new()
    {
        { 1, new[] { "Buso_Rojo", "Mangas_Rojas", "Chaqueta_Negra", "Mochila", "Correa", "Invasor_" } },
        { 2, new[] { "Chaqueta_Azul", "Chaqueta_Azul_Mangas", "Mochila", "Correa" } },
        { 3, new[] { "Negro_Torso", "Negro_Mangas" } },
        { 4, new[] { "Traje_Suit" } },
        { 5, new[] { "Chaqueta_Punk" } },
    };

    void OnEnable() => Aplicar();
    void OnValidate() => Aplicar();

    public void SetEtapa(int nueva)
    {
        etapa = Mathf.Clamp(nueva, 1, 5);
        Aplicar();
    }

    public void Aplicar()
    {
        var visibles = PorEtapa[Mathf.Clamp(etapa, 1, 5)];
        foreach (var r in GetComponentsInChildren<Renderer>(true))
        {
            var nombre = Base(r.gameObject.name);
            if (!EsPrenda(nombre)) continue;
            r.gameObject.SetActive(EsVisible(nombre, visibles));
        }
    }

    static string Base(string nombre) => Regex.Replace(nombre, @"\.\d+$", "");

    static bool EsPrenda(string nombre)
    {
        foreach (var p in Prendas)
            if (Coincide(nombre, p)) return true;
        return false;
    }

    static bool EsVisible(string nombre, string[] visibles)
    {
        foreach (var p in visibles)
            if (Coincide(nombre, p)) return true;
        return false;
    }

    static bool Coincide(string nombre, string patron)
    {
        if (patron.EndsWith("_")) return nombre.StartsWith(patron);
        return nombre == patron;
    }
}
