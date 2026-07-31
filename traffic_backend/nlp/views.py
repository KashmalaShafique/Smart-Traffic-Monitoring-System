import os
import sys
from django.http import JsonResponse
from django.conf import settings

sys.path.append(settings.SRC_DIR)

from nlp_module import extract_incidents

def get_incidents(request):
    try:
        incidents = extract_incidents()

        high = len([i for i in incidents if i['severity'] == 'HIGH'])
        medium = len([i for i in incidents if i['severity'] == 'MEDIUM'])
        low = len([i for i in incidents if i['severity'] == 'LOW'])

        return JsonResponse({
            'total': len(incidents),
            'summary': {
                'HIGH': high,
                'MEDIUM': medium,
                'LOW': low
            },
            'incidents': incidents
        })

    except Exception as e:
        return JsonResponse({'error': str(e)})