import odoorpc

def list_stages():
    try:
        odoo = odoorpc.ODOO('localhost', port=8069)
        odoo.login('odoo', 'marthagarcia10b@gmail.com', 'Qwe.123*')
        
        stage_ids = odoo.env['crm.stage'].search([])
        stages = odoo.env['crm.stage'].read(stage_ids, ['name'])
        
        print("===== Odoo CRM Stages =====")
        for stage in stages:
            print(f"ID: {stage['id']}, Name: {stage['name']}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_stages()
