from rest_framework.views import APIView
from rest_framework.response import Response
import odoorpc
import os
import traceback

def log_error(msg):
    with open('/home/martha/Desktop/app_odoo/api_errors.txt', 'a') as f:
        f.write(msg + "\n" + "="*50 + "\n")


def get_odoo_connection():
    # Centralized configuration
    host = 'localhost' 
    port = 8069
    db = 'odoo'
    user = 'odoo'
    password = 'odoo'
    
    odoo = odoorpc.ODOO(host, port=port)
    odoo.login(db, user, password)
    return odoo


class OportunidadesList(APIView):
    def get(self, request):
        try:
            odoo = get_odoo_connection()
            ids = odoo.env['crm.lead'].search([])
            leads = odoo.env['crm.lead'].read(ids, ['name', 'expected_revenue', 'stage_id', 'create_date', 'type', 'priority'])

            data = []
            for lead in leads:
                data.append({
                    "id": lead["id"],
                    "name": lead["name"],
                    "expected_revenue": lead["expected_revenue"],
                    "stage": lead["stage_id"][1] if lead["stage_id"] else None,
                    "stage_id": lead["stage_id"][0] if lead["stage_id"] else None,
                    "create_date": lead["create_date"],
                    "type": lead["type"],
                    "priority": int(lead.get("priority", 0))
                })

            return Response(data)

        except Exception as e:
            error_details = {"error": str(e), "traceback": traceback.format_exc()}
            log_error(f"DEBUG GET ERROR: {error_details}")
            return Response(error_details, status=500)

    def post(self, request):
        try:
            odoo = get_odoo_connection()

            vals = {
                'name': request.data.get('name'),
                'expected_revenue': request.data.get('expected_revenue'),
                'type': 'opportunity', # Ensure it's treated as an opportunity
            }
            
            if request.data.get('stage_id'):
                vals['stage_id'] = request.data.get('stage_id')

            new_id = odoo.env['crm.lead'].create(vals)
            
            # Fetch the created record to return full details
            lead = odoo.env['crm.lead'].read([new_id], ['name', 'expected_revenue', 'stage_id'])[0]

            return Response({
                "id": lead["id"],
                "name": lead["name"],
                "expected_revenue": lead["expected_revenue"],
                "stage": lead["stage_id"][1] if lead["stage_id"] else None,
                "stage_id": lead["stage_id"][0] if lead["stage_id"] else None
            }, status=201)

        except Exception as e:
            error_details = {"error": str(e), "traceback": traceback.format_exc()}
            log_error(f"DEBUG POST ERROR: {error_details}")
            return Response(error_details, status=500)


class OportunidadDetail(APIView):
    def patch(self, request, pk):
        try:
            odoo = get_odoo_connection()

            vals = {}
            if 'stage_id' in request.data:
                vals['stage_id'] = request.data['stage_id']
            if 'name' in request.data:
                vals['name'] = request.data['name']
            if 'expected_revenue' in request.data:
                vals['expected_revenue'] = request.data['expected_revenue']
            if 'type' in request.data:
                vals['type'] = request.data['type']

            odoo.env['crm.lead'].write([pk], vals)

            return Response({"success": True, "id": pk})

        except Exception as e:
            error_details = {
                "error": str(e), 
                "traceback": traceback.format_exc(),
                "data_attempted": vals if 'vals' in locals() else {},
                "pk_attempted": pk
            }
            log_error(f"DEBUG PATCH ERROR: {error_details}")
            return Response(error_details, status=500)

    def delete(self, request, pk):
        try:
            odoo = get_odoo_connection()
            odoo.env['crm.lead'].unlink([pk])
            return Response({"success": True, "id": pk}, status=204)

        except Exception as e:
            error_details = {"error": str(e), "traceback": traceback.format_exc()}
            log_error(f"DEBUG DELETE ERROR: {error_details}")
            return Response(error_details, status=500)
