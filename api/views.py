from rest_framework.views import APIView
from rest_framework.response import Response
import odoorpc


class OportunidadesList(APIView):
    def get(self, request):
        try:
            odoo = odoorpc.ODOO('localhost', port=8069)

            odoo.login(
                'odoo',
                'marthagarcia10b@gmail.com',
                'Qwe.123*'
            )

            ids = odoo.env['crm.lead'].search([])

            leads = odoo.env['crm.lead'].read(
                ids,
                ['name', 'expected_revenue', 'stage_id']
            )

            data = []

            for lead in leads:
                data.append({
                    "id": lead["id"],
                    "name": lead["name"],
                    "expected_revenue": lead["expected_revenue"],
                    "stage": lead["stage_id"][1] if lead["stage_id"] else None
                })

            return Response(data)

        except Exception as e:
            return Response({"error": str(e)}, status=500)
