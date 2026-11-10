#!/usr/bin/env python3
# Uso: python3 extraer.py ley.pdf reglamento.pdf carpeta_salida   (requiere pdftotext de poppler-utils)
# Genera ley_32069.json, reglamento_ley_32069.json y enlaces_ley_reglamento.json en carpeta_salida.
import re, json, sys, os, subprocess, tempfile
ORD=r'(?:PRIMERA|SEGUNDA|TERCERA|CUARTA|QUINTA|SEXTA|S[ÉE]PTIMA|OCTAVA|NOVENA|D[ÉE]CIMA|UND[ÉE]CIMA|DUOD[ÉE]CIMA|VIG[ÉE]SIMA|TRIG[ÉE]SIMA|CUADRAG[ÉE]SIMA|QUINCUAG[ÉE]SIMA|SEXAG[ÉE]SIMA|SEPTUAG[ÉE]SIMA|OCTOG[ÉE]SIMA|NONAG[ÉE]SIMA|DECIMO ?\w+|DECIMOPRIMERA|VIGESIMO\w+|[ÚU]NICA)(?: ?[\w]*)?'
art_re=re.compile(r'^\s*Artículo\s+(\d+)(?:-([A-Z]))?\s*[.\-]+\s*(.*)$')
head_re=re.compile(r'^\s*(TÍTULO|CAPÍTULO|SUBCAPÍTULO|T[ÍI]TULO PRELIMINAR)\s+([IVXLC0-9]+|PRELIMINAR)\s*$')
disp_sec=re.compile(r'^\s*(DISPOSICIONES COMPLEMENTARIAS (?:FINALES|TRANSITORIAS|MODIFICATORIAS|DEROGATORIAS)|DISPOSICI[ÓO]N COMPLEMENTARIA \w+|ANEXO.*|DISPOSICIONES FINALES)\s*$')
disp_re=re.compile(r'^\s*('+ORD+r')\.\s*-?\s*(.*)$')
def clean(s): return re.sub(r'\s+',' ',s).strip()
def parse(fn,start):
    L=open(fn,encoding='utf-8').read().replace('\f','\n').split('\n')
    if start is None: start=next(k for k,x in enumerate(L) if re.match(r'^\s*T[ÍI]TULO I\s*$',x))
    L=L[start:]
    for k,x in enumerate(L):
        if k>len(L)//2 and re.match(r'^\s*FE DE ERRATAS\s*$',x): L=L[:k]; break
    L=[x for x in L if not re.match(r'^\s*P[áa]gina \d+ de \d+\s*$',x) and not re.match(r'^\s*(Reglamento de la Ley Nº 32069|Ley General de Contrataciones Públicas)[^.]*$',x) or len(x.strip())>90]
    arts=[];struct=[];cur=None;ctx={'titulo':None,'capitulo':None,'subcapitulo':None}
    sec=None;i=0;mode='art'
    def flush():
        nonlocal cur
        if cur: cur['texto']='\n'.join(cur['_l']).strip(); del cur['_l']; arts.append(cur); cur=None
    while i<len(L):
        l=L[i]
        m=head_re.match(l)
        if m and (m.group(1)!='CAPÍTULO' or True):
            # skip if looks like body mention: require next nonblank to be uppercase name
            j=i+1; name=[]
            while j<len(L) and not L[j].strip(): j+=1
            while j<len(L) and L[j].strip() and len(name)<4 and not art_re.match(L[j]) and not head_re.match(L[j]):
                name.append(L[j].strip()); j+=1
            nm=clean(' '.join(name))
            if nm and len(nm)<200:
                flush(); kind=m.group(1).lower().replace('í','i'); ctx_key={'titulo':'titulo','capitulo':'capitulo','subcapitulo':'subcapitulo'}.get(kind,'titulo')
                ent={'tipo':kind,'numero':m.group(2),'nombre':nm.capitalize() if False else nm}
                if kind=='titulo': ctx.update(titulo=ent,capitulo=None,subcapitulo=None); mode='art'
                elif kind=='capitulo': ctx.update(capitulo=ent,subcapitulo=None)
                else: ctx['subcapitulo']=ent
                struct.append(ent); i=j; continue
        m=disp_sec.match(l)
        if m and l.strip().upper()==l.strip():
            flush(); sec=clean(m.group(1)); mode='disp'; i+=1; continue
        if mode=='art':
            m=art_re.match(l)
            if m:
                flush(); t=m.group(3).strip(); j=i+1
                if j<len(L) and L[j].strip() and (t.count('(')>t.count(')') or (L[j].strip()[:1].islower() and len(t)>=40) or (len(t)>=70 and len(L[j].strip())<60 and not re.match(r'^(\d+\.|[a-z]\)|\(\*\))',L[j].strip()))):
                    t+=' '+L[j].strip(); j+=1
                num=m.group(1)+('-'+m.group(2) if m.group(2) else '')
                cur={'id':num,'numero':num,'titulo_articulo':clean(t),'titulo':ctx['titulo'] and ctx['titulo']['numero'],'capitulo':ctx['capitulo'] and ctx['capitulo']['numero'],'subcapitulo':ctx['subcapitulo'] and ctx['subcapitulo']['numero'],'_l':[]}
                i=j; continue
            if cur is not None: cur['_l'].append(l.rstrip())
        else:
            m=disp_re.match(l)
            if m and l.strip()[:3].isupper():
                flush(); t=m.group(2).strip()
                cur={'id':sec+'|'+clean(m.group(1)),'seccion':sec,'numero':clean(m.group(1)),'titulo_articulo':clean(t),'_l':[]}
                i+=1; continue
            if cur is not None: cur['_l'].append(l.rstrip())
        i+=1
    flush()
    return arts,struct

NUM=r'\d+(?:\.\d+)?(?:-[A-Z])?'
LIST=re.compile(r'[Aa]rtículos?\s+('+NUM+r'(?:\s*(?:,|y|e|o|al|a|u)\s*'+NUM+r')*)([^.;]{0,90})')
def expand(s):
    toks=re.findall(r'('+NUM+r')|(\bal\b|\ba\b)',s); out=[];rng=False
    for n,r in toks:
        if r: rng=True; continue
        n=n.split('.')[0] if '-' not in n else n.split('.')[0]
        n=re.sub(r'\.\d+','',n)
        if rng and out and n.isdigit() and out[-1].isdigit():
            out+= [str(k) for k in range(int(out[-1])+1,int(n)+1)]; rng=False
        else: out.append(n); rng=False
    return out
def refs(text,own):
    ley=set();reg=set()
    for m in LIST.finditer(text):
        tail=m.group(2)
        nums=expand(m.group(1))
        # el calificador sólo cuenta si aparece antes de otro "artículo"
        t=tail.split('rtículo')[0]
        if re.search(r'\b(de|del) (la )?(presente )?Ley\b|\bde la Ley\b',t): ley.update(nums)
        elif re.search(r'\bdel? (presente )?Reglamento\b|\bdel presente\b',t) : reg.update(nums)
        elif re.search(r'\bde la presente (norma|ley)\b',t): (ley if own=='ley' else reg).update(nums)
        else: (ley if own=='ley' else reg).update(nums)
    return ley,reg
def finish(a):
    seen={};out=[]
    for x in a:
        t=x['texto']; notas=[];body=[]
        blk=re.split(r'\n\s*\n',t)
        for b in blk:
            (notas if b.lstrip().startswith('(*)') else body).append(b.strip())
        x['texto']='\n\n'.join(b for b in body if b)
        # separar versión futura (texto repetido del mismo artículo dentro de una nota)
        x['notas']=[re.sub(r'\s+',' ',n) for n in notas if n]
        if x['id'] in seen and 'seccion' not in x:
            seen[x['id']]['texto_modificacion_pendiente']=(x['titulo_articulo']+'\n'+x['texto']).strip(); continue
        seen[x['id']]=x; out.append(x)
    return out
if len(sys.argv)!=4: sys.exit(__doc__ or 'Uso: extraer.py ley.pdf reglamento.pdf salida')
OUT=sys.argv[3].rstrip('/')+'/'; os.makedirs(OUT,exist_ok=True)
tmp=tempfile.mkdtemp()
for pdf,n in ((sys.argv[1],'ley.txt'),(sys.argv[2],'reglamento.txt')):
    subprocess.run(['pdftotext','-layout',pdf,os.path.join(tmp,n)],check=True)
ley,sl=parse(os.path.join(tmp,'ley.txt'),None); reg,sr=parse(os.path.join(tmp,'reglamento.txt'),None)
ley=finish(ley); reg=finish(reg)
for x in ley: x['tipo']='articulo' if 'seccion' not in x else 'disposicion'
for x in reg: x['tipo']='articulo' if 'seccion' not in x else 'disposicion'
lid={x['id'] for x in ley}; rid={x['id'] for x in reg}
for x in ley:
    l,r=refs(x['texto'],'ley'); x['refiere_ley']=sorted(l&lid,key=lambda s:(len(s),s)); x['refiere_reglamento']=sorted(r&rid,key=lambda s:(len(s),s))
for x in reg:
    l,r=refs(x['texto'],'reg'); x['refiere_ley']=sorted(l&lid,key=lambda s:(len(s),s)); x['refiere_reglamento']=sorted((r&rid)-{x['id']},key=lambda s:(len(s),s))
# enlace Ley -> Reglamento: artículos del Reglamento que citan el artículo de la Ley
ley_to_reg={x['id']:[] for x in ley}
for x in reg:
    for n in x['refiere_ley']: ley_to_reg[n].append(x['id'])
for x in ley:
    x['reglamento_desarrolla']=sorted(ley_to_reg[x['id']],key=lambda s:(len(s),s))
    del x['refiere_reglamento']
for x in reg: x['ley_desarrollada']=x.pop('refiere_ley')
for x in ley: x['refiere_ley_interno']=x.pop('refiere_ley')
import math,collections,unicodedata
def toks(s):
    s=unicodedata.normalize('NFD',s.lower()); s=''.join(c for c in s if not unicodedata.combining(c))
    return [w for w in re.findall(r'[a-z]{4,}',s) if w not in STOP]
STOP=set('para como esta este estos estas sobre entre cuando donde desde hasta segun cada otro otra otros otras puede pueden deben debe deber ley reglamento articulo numeral norma presente dicha dicho mismo misma tambien contratacion contrataciones publica publicas entidad entidades contratante contratantes'.split())
def vec(x): 
    c=collections.Counter(toks(x['titulo_articulo']))
    for k in c: c[k]*=3
    c.update(toks(x['texto'][:3000])); return c
docs=[x for x in reg if x['tipo']=='articulo']; ld=[x for x in ley if x['tipo']=='articulo']
V={('r',x['id']):vec(x) for x in docs}; V.update({('l',x['id']):vec(x) for x in ld})
df=collections.Counter(); 
for v in V.values(): df.update(v.keys())
N=len(V); 
def tf(v): 
    w={k:(1+math.log(n))*math.log(N/df[k]) for k,n in v.items()}; nr=math.sqrt(sum(a*a for a in w.values())) or 1; return {k:a/nr for k,a in w.items()}
W={k:tf(v) for k,v in V.items()}
for x in ld:
    a=W[('l',x['id'])]; sc=[]
    for y in docs:
        if y['id'] in x['reglamento_desarrolla']: continue
        bb=W[('r',y['id'])]; s=sum(a[k]*bb[k] for k in a if k in bb); sc.append((s,y['id']))
    sc.sort(reverse=True)
    x['reglamento_relacionado_por_tema']=[{'id':i,'similitud':round(s,3)} for s,i in sc[:3] if s>=0.2]
json.dump({'norma':'Ley Nº 32069, Ley General de Contrataciones Públicas','estructura':sl,'articulos':ley},open(OUT+'ley_32069.json','w'),ensure_ascii=False,indent=1)
json.dump({'norma':'Reglamento de la Ley Nº 32069 (con modificaciones hasta 26-10-2026)','estructura':sr,'articulos':reg},open(OUT+'reglamento_ley_32069.json','w'),ensure_ascii=False,indent=1)
enl=[{'ley':x['id'],'reglamento':x['reglamento_desarrolla']} for x in ley if x['tipo']=='articulo' and x['reglamento_desarrolla']]
json.dump(enl,open(OUT+'enlaces_ley_reglamento.json','w'),ensure_ascii=False,indent=1)
la=[x for x in ley if x['tipo']=='articulo']
print(len(ley),len(reg),'ley arts con enlaces:',len(enl),'de',len(la))
print('reg arts con ref a ley:',sum(1 for x in reg if x.get('ley_desarrollada')),'de',sum(1 for x in reg if x['tipo']=='articulo'))
print([ (x['id']) for x in la if not x['reglamento_desarrolla']][:80])
for e in sr[:40]: print(e['tipo'],e['numero'],e['nombre'][:70])
