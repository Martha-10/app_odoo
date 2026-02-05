import odoorpc

# Conexión
odoo = odoorpc.ODOO('tu-url-de-odoo.com', port=443)
odoo.login('nombre_db', 'tu_usuario', 'tu_password')

# Leer oportunidades (crm.lead)
ids = odoo.env['crm.lead'].search([])
opportunities = odoo.env['crm.lead'].read(ids, ['name', 'planned_revenue', 'stage_id'])

print(opportunities) # Si esto imprime algo en consola, ¡YA GANASTE!