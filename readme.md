Crea en html, css y JS una pagina web que tenga dos seciones una a la izquierda que tenga un formulario donde primero tiene un titulo de formulario encuesta, un select de grupo, una input de satisfacion global de 1 al 5 y un text area donde puedes poner un comentario y un boton donde puedes guardar la respuesta que se añadera en la secion de la derecha en una subscion de ultimas respuestas que ya tendra una respuestas pro defecto y dependeindo del si es 1 al 5 el color es mas verde o amarillo o rojo, y esto se pone al final de la seción de la derecha. Y arriba de la secion de la derecha ponemos un titulo de panell analitico, un select de filtro de panell, debajo un texto donde explica que muestra los datos  del grupo selecionado del formulario y con cuatro cuadraditos diciendo las respuestas totales que hay, la mediana, el porcentaje de respuestas con puntuacion de 4 y 5 y el grupo analizado. Debajo una secion con un subtitulo de distribucion de valoraciones y habajo como unas rayas donde pone visualmente cuantas respuestas tiene una estrella, 2,3,4 y 5 la raya este mas rellenada de azul o menos dependiendo de la cantidaad. Abajo tenga un subtitulo de grafico de quesito donde ponga visalmente un circulo con la cantidad de puntuaciones proporcionalemnte con la puntuacion y su color dependiendo si es 1 a 5 y al lado otro grafico del mismo tipo de puntuaciones positivas (4-5) y no positivas (1-3). Debajo un subtitulo de comparativa de mediana del grupo y tres rayitas de cada puntuacion dependiendo de la puntuacion mediana de cada grupo y debajo de todo esto pues las respuestas que ya habia comentado antes.


—------------------------------------------------------------

crea una nueva rama y en esta nueva rama vamos a hacer que las datos esten en una base de datos de supabase. Vamos a hacer que los datos se inserten a la base datos que pongamos en lugar del array y que despues se aplique en el lugar correspondiente. Las claves son eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhhc3N4cm14anZya3RxbW15dmN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTc4MzgsImV4cCI6MjA5NDY5MzgzOH0.UaxlYNomjhsbv3cMa8Hn9hVwhylFLqSP9O_iwUYqOK8 y la API https://hassxrmxjvrktqmmyvcv.supabase.co/rest/v1/

—------------------------------------------------------------

y las columnas se llama asín:
id (UUID, PK, autogenerado)
group (text)
rating (integer, con validación 1 a 5)
comment (text)
created_at (timestamptz, default now())
