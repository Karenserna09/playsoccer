# APRENDIZAJE

## a) ¿Qué es useState y cuándo usarlo?

useState es un hook de React que permite almacenar información dinámica que cambia durante la ejecución.

Ejemplos del proyecto:

const [searchTerm,setSearchTerm]=useState("");

const [favorites,setFavorites]=useState([]);

const [darkMode,setDarkMode]=useState(true);

Se utiliza cuando necesitamos actualizar la interfaz al cambiar datos.

---

## b) ¿Qué es useEffect y casos de uso?

useEffect permite ejecutar acciones cuando algo cambia.

Sin dependencias:

useEffect(()=>{})

Se ejecuta siempre.

Con []:

useEffect(()=>{},[])

Solo una vez.

Con [dependencia]:

useEffect(()=>{},[searchTerm])

Solo cuando cambia.

Ejemplo cleanup:

return ()=>clearTimeout(timer)

Esto elimina procesos anteriores.

---

## c) ¿Qué es useMemo?

Permite optimizar cálculos y evitar renderizados innecesarios.

Ejemplo:

const stats=useMemo(()=>{

return{
total,
averageAge
}

},[filteredPlayers])

Diferencia:
useMemo guarda resultados.
useCallback guarda funciones.

---

## d) ¿Cómo funciona cleanup?

El cleanup elimina procesos anteriores.

Ejemplo:

return ()=>clearTimeout(timer)

Se utilizó en debounce.

---

## e) ¿Cómo funciona localStorage?

Permite guardar información aunque la página se cierre.

Ejemplo:

localStorage.setItem(
"favorites",
JSON.stringify(favorites)
)

localStorage.getItem("favorites")

Se utilizó para:

- favoritos
- historial
- modo oscuro

IA utilizada:
ChatGPT OpenAI
