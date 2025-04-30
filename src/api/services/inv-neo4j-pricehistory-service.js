// Importa la instancia del driver de Neo4j desde la configuración
const driverInstance = require("../../config/connectToNeo4j");


// Función para obtener todos los nodos de tipo Day, Price y sus relaciones
async function N4GetALL(req) {
    // Crea una nueva sesión para interactuar con la base de datos
    const session = driverInstance.session();

    try {
        let query; // Aquí guardaremos la consulta a ejecutar
        const Type = req.req.query?.Type; // Obtenemos el tipo (Node o Rela) desde el request
        const IdNode = parseInt(req.req.query?.IdNode); // Parseamos el ID del nodo si viene
        const IdRela = parseInt(req.req.query?.IdRela); // Parseamos el ID de la relación si viene

        // Si recibimos un tipo y un ID válido, entramos a la lógica
        if (Type != null && (IdNode != null || IdRela != null)) {
            switch (Type) {
                // Caso cuando queremos traer información de un Nodo
                case 'Node':
                    query = `MATCH (n)
                        WHERE ID(n) = $IdNode
                        OPTIONAL MATCH (n)-[r]->(m) // Buscamos relaciones salientes del nodo
                        WITH n, 
                            labels(n) AS nodeLabels, 
                            COLLECT(r) AS relationships, 
                            COLLECT(m) AS relatedNodes,
                            [rel IN collect(r) WHERE type(rel) = 'HAS_PRICE'] AS priceRels, // Filtra relaciones HAS_PRICE
                            [rel IN collect(r) WHERE type(rel) = 'NEXT_DAY'] AS nextDayRels, // Filtra relaciones NEXT_DAY
                            [node IN collect(m) WHERE 'Price' IN labels(node)] AS priceNodes, // Filtra nodos tipo Price
                            [node IN collect(m) WHERE 'Day' IN labels(node)] AS dayNodes // Filtra nodos tipo Day

                        RETURN {
                        day: CASE WHEN n.date IS NOT NULL THEN { // Si el nodo es un Day
                            id: toString(n.id),
                            date: toString(date({ year: n.date.year, month: n.date.month, day: n.date.day })),
                            volume: n.volume
                        } ELSE null END,

                        price: CASE WHEN n.open IS NOT NULL THEN { // Si el nodo es un Price
                            Nid: toString(id(n)),
                            open: n.open,
                            high: n.high,
                            low: n.low,
                            close: n.close
                        } ELSE null END,

                        relationshipPrice: CASE WHEN size(priceRels) > 0 AND size(priceNodes) > 0 THEN { // Relación hacia Price
                            relationshipId: toString(id(priceRels[0])),
                            type: type(priceRels[0]),
                            from: toString(id(startNode(priceRels[0]))),
                            to: toString(id(endNode(priceRels[0]))),
                            toNode: {
                            type: labels(priceNodes[0])[0],
                            properties: properties(priceNodes[0])
                            }
                        } ELSE null END,

                        relationshipDay: CASE WHEN size(nextDayRels) > 0 AND size(dayNodes) > 0 THEN { // Relación hacia Day
                            relationshipId: toString(id(nextDayRels[0])),
                            type: type(nextDayRels[0]),
                            from: toString(id(startNode(nextDayRels[0]))),
                            to: toString(id(endNode(nextDayRels[0]))),
                            toNode: {
                            type: labels(dayNodes[0])[0],
                            properties: {
                                id: toString(dayNodes[0].id),
                                volume: dayNodes[0].volume,
                                date: toString(date({
                                year: dayNodes[0].date.year,
                                month: dayNodes[0].date.month,
                                day: dayNodes[0].date.day
                                }))
                            }
                            }
                        } ELSE null END
                        } AS result
                        `;

                        // Ejecutamos la consulta pasando el ID del nodo
                        const all = await session.run(
                        query,{ IdNode: IdNode }
                        );

                    // Mapeamos el resultado para ordenar los campos como queremos
                    const orderedResults = all.records.map((record) => {
                        const result = record.get("result");
                        return {
                            // Agregamos los campos solo si existen (no nulos)
                            ...(result.day && { day: result.day }),
                            ...(result.price && { price: result.price }),
                            ...(result.relationshipPrice && { relationshipPrice: result.relationshipPrice }),
                            ...(result.relationshipDay && { relationshipDay: result.relationshipDay })
                        };
                    });

                    // Devolvemos la respuesta ordenada
                    return orderedResults;

                // Caso cuando queremos traer información de una Relación
                case 'Rela':
                    query = `
                        MATCH ()-[r]->()
                    WHERE id(r) = $IdRela
                    WITH r, 
                        endNode(r) AS toNode, 
                        labels(endNode(r))[0] AS toLabel,
                        startNode(r) AS fromNode,
                        labels(startNode(r))[0] AS fromLabel
                    RETURN {
                    relationshipId: toString(id(r)),
                    type: type(r),
                    from: toString(id(fromNode)),
                    to: toString(id(toNode)),
                    fromNode: { // Información del nodo de origen
                        type: fromLabel,
                        properties: CASE 
                        WHEN fromLabel = 'Day' THEN { // Si el nodo es Day, formatea fecha y volumen
                            id: toString(fromNode.id),
                            volume: fromNode.volume,
                            date: toString(date({
                            year: fromNode.date.year,
                            month: fromNode.date.month,
                            day: fromNode.date.day
                            }))
                        }
                        ELSE properties(fromNode) // Si no es Day, retorna todas sus propiedades
                        END
                    },
                    toNode: { // Información del nodo de destino
                        type: toLabel,
                        properties: CASE 
                        WHEN toLabel = 'Day' THEN { // Mismo caso que el fromNode
                            id: toString(toNode.id),
                            volume: toNode.volume,
                            date: toString(date({
                            year: toNode.date.year,
                            month: toNode.date.month,
                            day: toNode.date.day
                            }))
                        }
                        ELSE properties(toNode)
                        END
                    }
                    } AS result
                    `;
                    // Ejecutamos la consulta pasando el ID de la relación
                    const relaciones = await session.run(
                        query,{ IdRela: IdRela }
                    );
                    // Retornamos solo el primer resultado
                    return relaciones.records[0].get('result');
            }
        } else {
            // Si no viene ni Type ni IDs, hacemos un match general
            const all = await session.run(
                `MATCH (d:Day)-[h:HAS_PRICE]->(p:Price)
                    OPTIONAL MATCH (d)-[n:NEXT_DAY]->(nextDay)
                    RETURN {
                        day: {
                            id: toString(d.id),
                            date: toString(date({ year: d.date.year, month: d.date.month, day: d.date.day })),
                            volume: d.volume
                        },
                        price: p {
                            Nid: toString(id(p)),
                            open: p.open,
                            high: p.high,
                            low: p.low,
                            close: p.close
                        },
                        relationshipPrice: { // Información de la relación HAS_PRICE
                            relationshipId: toString(id(h)),
                            type: type(h),
                            from: toString(d.id),
                            to: toString(id(p))
                        },
                        relationshipDay: CASE WHEN n IS NOT NULL THEN { // Información de la relación NEXT_DAY si existe
                            relationshipId: toString(id(n)),
                            type: type(n),
                            from: toString(d.id),
                            to: toString(nextDay.id)
                        } ELSE null END
                    } as result
                    ORDER BY d.date ASC`
            );

            // Mapeamos el resultado para ordenarlo
            const orderedResults = all.records.map((record) => {
                const result = record.get("result");
                return {
                    ...(result.day && { day: result.day }),
                    ...(result.price && { price: result.price }),
                    ...(result.relationshipPrice && { relationshipPrice: result.relationshipPrice }),
                    ...(result.relationshipDay && { relationshipDay: result.relationshipDay })
                };
            });

            // Devolvemos la respuesta ordenada
            return orderedResults;
        }

    } catch (error) {
        // Si algo falla, capturamos y retornamos el error
        return error;
    } finally {
        // Siempre cerramos la sesión, haya fallado o no
        await session.close();
    }
}
async function AddOneNode(req) {
    const body = req.req.body.body;
    console.log('body: ',body);
    const session = driverInstance.session({ database: 'neo4j' });
    try {
        // Convertir los parámetros a sus tipos correctos usando WITH y funciones Cypher.
        const result = await session.run(`
            WITH date($date) AS parsedDate,
                toInteger($id) AS idValue,
                toFloat($volume) AS volumeValue,
                toFloat($open) AS openValue,
                toFloat($high) AS highValue,
                toFloat($low) AS lowValue,
                toFloat($close) AS closeValue
            MERGE (d:Day { date: parsedDate, id: idValue, volume: volumeValue })
            MERGE (p:Price {
                open: openValue,
                high: highValue,
                low: lowValue,
                close: closeValue
            })
            MERGE (d)-[:HAS_PRICE]->(p)
            RETURN {
                day: {
                    id: toString(d.id),
                    date: toString(date({ year: d.date.year, month: d.date.month, day: d.date.day })),
                    volume: d.volume
                },
                price: p {
                    Nid: toString(id(p)),
                    open: p.open,
                    high: p.high,
                    low: p.low,
                    close: p.close
                }
            } as result
            `,
            {
                id: body.ID,
                date: body.DATE,
                volume: body.VOLUME,
                open: body.OPEN,
                high: body.HIGH,
                low: body.LOW,
                close: body.CLOSE
            });

            return result.records[0].get('result');
    } catch (error) {
        console.error('Error en el servicio:', error);
        return error;
    }finally{
        await session.close();
    }
}
async function UpdateNode(req) {
    const id = parseInt(req.req.query?.id);
    const cambios = req.req.body.body;
    console.log('Cambios: ',cambios);
    const session = driverInstance.session({database:'neo4j'});
    try {
        const res = await session.run(`
            WITH date($date) AS parsedDate,
                toInteger($id) AS idValue,
                toFloat($volume) AS volumeValue,
                toFloat($open) AS openValue,
                toFloat($high) AS highValue,
                toFloat($low) AS lowValue,
                toFloat($close) AS closeValue
            // Buscar el nodo Day existente con el id y la fecha especificados.
            MATCH (d:Day { id: idValue})
            // Relacionar hacia el nodo Price
            MATCH (d)-[:HAS_PRICE]->(p:Price)
            // Actualizar las propiedades de ambos nodos
            SET d.volume = volumeValue,
                d.date = parsedDate,
                p.open  = openValue,
                p.high  = highValue,
                p.low   = lowValue,
                p.close = closeValue
            RETURN {
                day: {
                    id: toString(d.id),
                    date: toString(date({ year: d.date.year, month: d.date.month, day: d.date.day })),
                    volume: d.volume
                },
                price: p {
                    Nid: toString(id(p)),
                    open: p.open,
                    high: p.high,
                    low: p.low,
                    close: p.close
                }
            } as result
            `,
            {
                id: id,
                date: cambios.DATE,
                volume: cambios.VOLUME,
                open: cambios.OPEN,
                high: cambios.HIGH,
                low: cambios.LOW,
                close: cambios.CLOSE
            });
            console.log('RES: ',res);
            return res.records[0].get('result');
    } catch (error) {
        console.error('Error en el servicio:', error);
        return error;
    } finally {
        await session.close();
    }
}
async function DeleteNode(req) {
    const id = parseInt(req.req.query?.id);
    const session = driverInstance.session({database:'neo4j'});
    try { 
        const res = await session.run(`
            MATCH (d)-[:HAS_PRICE]->(p:Price)
            WHERE d.id = $nodeId
            DETACH DELETE d,p
            `, { nodeId: id }); //Esta consulta elimina tanto al nodo como a su relación con el precio

        return res;
    } catch (error) {
        console.log('Error en el servicio: ', error);
        return error;
    }finally{
        await session.close();
    }
}



// Exportamos la función para que pueda ser usada en otros archivos
module.exports = {
    N4GetALL,
    AddOneNode,
    UpdateNode,
    DeleteNode
};