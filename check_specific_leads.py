import odoorpc

def check_leads(ids):
    try:
        odoo = odoorpc.ODOO('localhost', port=8069)
        odoo.login('odoo', 'marthagarcia10b@gmail.com', 'Qwe.123*')
        
        leads = odoo.env['crm.lead'].read(ids, ['name', 'stage_id', 'type'])
        
        print("===== Odoo Lead Check =====")
        for lead in leads:
            print(f"ID: {lead['id']}, Name: {lead['name']}, Stage: {lead['stage_id']}, Type: {lead['type']}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_leads([5, 8, 13])
