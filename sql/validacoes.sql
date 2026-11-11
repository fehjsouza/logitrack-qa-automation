-- 1. Quantidade de embarques por status
SELECT
    status,
    COUNT(*) AS quantidade
FROM shipments
GROUP BY status
ORDER BY status;

-- 2. Quantidade e valor total por cliente
SELECT
    customer,
    COUNT(*) AS total_embarques,
    ROUND(SUM(value_usd), 2) AS valor_total_usd
FROM shipments
GROUP BY customer
ORDER BY total_embarques DESC, customer;

-- 3. Divergencias entre status e ultimo evento
WITH ultimo_evento AS (
    SELECT
        shipment_id,
        to_status,
        ROW_NUMBER() OVER (
            PARTITION BY shipment_id
            ORDER BY created_at DESC, id DESC
        ) AS posicao
    FROM shipment_events
)
SELECT
    s.reference,
    s.status AS status_atual,
    e.to_status AS ultimo_status_evento
FROM shipments s
LEFT JOIN ultimo_evento e
    ON e.shipment_id = s.id
    AND e.posicao = 1
WHERE e.shipment_id IS NULL
   OR s.status <> e.to_status;

-- 4. Violacoes de regras de negocio
SELECT
    id,
    reference,
    customer,
    origin,
    destination,
    incoterm,
    weight_kg,
    value_usd,
    status
FROM shipments
WHERE reference NOT GLOB 'LT-[0-9][0-9][0-9][0-9]-[0-9][0-9][0-9][0-9]'
   OR LENGTH(TRIM(customer)) NOT BETWEEN 2 AND 80
   OR TRIM(origin) = ''
   OR TRIM(destination) = ''
   OR LOWER(TRIM(origin)) = LOWER(TRIM(destination))
   OR incoterm NOT IN ('FOB', 'CIF', 'EXW', 'DAP', 'DDP')
   OR weight_kg <= 0
   OR weight_kg > 30000
   OR value_usd <= 0
   OR value_usd > 10000000
   OR status NOT IN (
       'CREATED', 'IN_TRANSIT', 'CUSTOMS',
       'DELIVERED', 'CANCELLED'
   );
