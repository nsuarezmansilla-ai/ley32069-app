"""Uso: python3 publicar_datos.py carpeta_datos carpeta_sitio "26/10/2026" "notas"
Convierte los JSON de datos/ al formato de la app, actualiza www/data.js y genera
el sitio de actualizaciones (sitio/datos/data.json y version.json)."""
import json,sys,os,subprocess,urllib.request
datos,sitio,fecha,notas=sys.argv[1],sys.argv[2],sys.argv[3],(sys.argv[4] if len(sys.argv)>4 else '')
here=os.path.dirname(os.path.abspath(__file__))
os.makedirs(f'{sitio}/datos',exist_ok=True)
subprocess.run([sys.executable,f'{here}/convert.py',datos,f'{sitio}/datos/data.json'],check=True)
D=json.load(open(f'{sitio}/datos/data.json',encoding='utf-8'))
nl,nr=len(D['ley']['arts']),len(D['reg']['arts'])
if nl<100 or nr<300: sys.exit(f'ERROR: muy pocos artículos (Ley {nl}, Reglamento {nr}). Revisa el PDF; no se publica nada.')
# versión: una más que la publicada actualmente
v=1
try:
    with urllib.request.urlopen(os.environ.get('UPDATE_BASE','')+'version.json',timeout=15) as r: v=int(json.load(r)['v'])+1
except Exception as e: print('Sin versión previa publicada, se usa la actual +1:',e); v=int(os.environ.get('MIN_VERSION','2'))
meta={'v':v,'fecha':fecha,'notas':notas}
json.dump(meta,open(f'{sitio}/datos/version.json','w',encoding='utf-8'),ensure_ascii=False)
www=os.path.join(here,'..','www','data.js')
open(www,'w',encoding='utf-8').write('window.DATA_META='+json.dumps(meta,ensure_ascii=False)+';\nwindow.DATA='+json.dumps(D,ensure_ascii=False,separators=(',',':'))+';')
print(f'OK: versión {v}, Ley {nl}, Reglamento {nr}')
