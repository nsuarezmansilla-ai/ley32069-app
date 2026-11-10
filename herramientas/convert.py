import json,re,sys
src,out=sys.argv[1],sys.argv[2]
def paras(t):
    ps=[];buf=[]
    for ln in t.split('\n'):
        ln=ln.strip()
        if not ln:
            if buf: ps.append(' '.join(buf)); buf=[]
            continue
        if buf and re.match(r'^(\d+\.\d+\.?|[a-zñ]\)|[ivx]+\.|- )',ln): ps.append(' '.join(buf)); buf=[]
        buf.append(ln)
    if buf: ps.append(' '.join(buf))
    return [re.sub(r'\s+',' ',p) for p in ps]
def conv(D):
    names={};t=c=None
    for e in D['estructura']:
        if e['tipo']=='titulo': t=e['numero'];c=None;names[(t,None,None)]=e['nombre']
        elif e['tipo']=='capitulo': c=e['numero'];names[(t,c,None)]=e['nombre']
        elif e['tipo']=='subcapitulo': names[(t,c,e['numero'])]=e['nombre']
    arts=[];tree=[];last=[None,None,None,None]
    for a in D['articulos']:
        if a['tipo']=='disposicion':
            sec=a['seccion'].title(); keys=[('D',sec)]
            lv=[(0,sec,'')]
        else:
            T,C,S=a.get('titulo'),a.get('capitulo'),a.get('subcapitulo')
            lv=[(0,f'Título {T}',names.get((T,None,None),''))]
            if C: lv.append((1,f'Capítulo {C}',names.get((T,C,None),'')))
            if S: lv.append((2,f'Subcapítulo {S}',names.get((T,C,S),'')))
        for l,lab,nm in lv:
            if last[l]!=(lab,nm,tuple(x[1] for x in lv[:l])):
                tree.append({'lvl':l,'label':lab,'name':nm,'first':len(arts)})
                last[l]=(lab,nm,tuple(x[1] for x in lv[:l]))
                for k in range(l+1,4): last[k]=None
        o={'id':a['id'],'n':a['numero'] if a['tipo']=='articulo' else a['numero'].title(),'t':a.get('titulo_articulo') or '','p':[f"{lab}"+(f" · {nm}" if nm else '') for _,lab,nm in lv],'x':paras(a['texto']),'nt':a.get('notas',[])}
        if a['tipo']=='disposicion': o['disp']=1
        if a.get('texto_modificacion_pendiente'): o['pend']=paras(a['texto_modificacion_pendiente'])
        o['_rd']=a.get('reglamento_desarrolla',[]); o['_rt']=a.get('reglamento_relacionado_por_tema',[]); o['_ld']=a.get('ley_desarrollada',[])
        arts.append(o)
    return {'tree':tree,'arts':arts}
L=conv(json.load(open(f'{src}/ley_32069.json'))); R=conv(json.load(open(f'{src}/reglamento_ley_32069.json')))
li={a['id']:i for i,a in enumerate(L['arts'])}; ri={a['id']:i for i,a in enumerate(R['arts'])}
miss=0
for a in L['arts']:
    a['rd']=[ri[x] for x in a.pop('_rd') if x in ri]; a['rt']=[ri[x['id']] for x in a.pop('_rt') if x['id'] in ri and ri[x['id']] not in a['rd']]; a.pop('_ld')
for a in R['arts']:
    fl=[];[fl.extend(x if isinstance(x,list) else [x]) for x in a.pop('_ld')];a['ld']=sorted(set(li[x] for x in fl if x in li)); a.pop('_rd'); a.pop('_rt')
for D in (L,R):
    for a in D['arts']: a.pop('id')
json.dump({'ley':L,'reg':R},open(out,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print(len(L['arts']),len(R['arts']),len(L['tree']),len(R['tree']),sum(1 for a in L['arts'] if a['rd']),sum(1 for a in L['arts'] if a['rt']),sum(1 for a in R['arts'] if a['ld']))
print(L['tree'][:4]); print(L['arts'][45]['p'])
