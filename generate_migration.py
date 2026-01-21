
import csv
import json

def get_hierarchy(cargo):
    cargo = cargo.upper()
    if 'GERENTE' in cargo: return 'gerente'
    if 'COORDENADOR' in cargo: return 'coordenador'
    if 'SUPERVISOR' in cargo: return 'supervisor'
    return 'colaborador'

def clean_int(val):
    if not val or val == '-': return 'NULL'
    return val

def clean_str(val):
    if not val or val == '-': return 'NULL'
    return f"'{val.replace("'", "''")}'"

def parse_date(val):
    if not val or val == '-': return 'NULL'
    # Format "10/11/2025, 10:01:49" -> '2025-11-10 10:01:49'
    try:
        date_part, time_part = val.split(', ')
        d, m, y = date_part.split('/')
        return f"'{y}-{m}-{d} {time_part}'"
    except:
        return 'NULL'

csv_file = r'c:\AeC SaaS\mapeamentodeperfilaec-main\dados.csv.csv'

print("-- AUTOMATIC IMPORT FROM dados.csv.csv")
print("INSERT INTO public.participants (registration, name, email, network_login, cargo, supervisor, coordinator, manager, hierarchy_level, is_active)")
print("VALUES")

participants_values = []
results_values = []

with open(csv_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        reg = row['Matrícula']
        name = clean_str(row['Nome'])
        email = clean_str(row['Email'])
        login = clean_str(row['Login de Rede'])
        cargo = clean_str(row['Cargo/Função'])
        sup = clean_str(row['Supervisor'])
        coord = clean_str(row['Coordenador'])
        mgr = clean_str(row['Gerente'])
        level = f"'{get_hierarchy(row['Cargo/Função'])}'"
        
        participants_values.append(f"({reg}, {name}, {email}, {login}, {cargo}, {sup}, {coord}, {mgr}, {level}, true)")
        
        if row['Status do Teste'] == 'Completado':
             # Matrícula,Nome,Email,Login de Rede,Cargo/Função,Supervisor,Coordenador,Gerente,Status do Teste,Perfil Dominante,Pontuação D,Pontuação I,Pontuação S,Pontuação C,Data de Conclusão
            dominant = clean_str(row['Perfil Dominante'])
            sd = clean_int(row['Pontuação D'])
            si = clean_int(row['Pontuação I'])
            ss = clean_int(row['Pontuação S'])
            sc = clean_int(row['Pontuação C'])
            date = parse_date(row['Data de Conclusão'])
            
            results_values.append(f"({reg}, {name}, {email}, {sd}, {si}, {ss}, {sc}, {dominant}, {date})")

print(",\n".join(participants_values))
print("ON CONFLICT (registration) DO UPDATE SET")
print("  name = EXCLUDED.name, email = EXCLUDED.email, cargo = EXCLUDED.cargo,")
print("  supervisor = EXCLUDED.supervisor, coordinator = EXCLUDED.coordinator,")
print("  manager = EXCLUDED.manager, hierarchy_level = EXCLUDED.hierarchy_level,")
print("  updated_at = now();")

print("\n\n-- INSERT RESULTS")
print("INSERT INTO public.test_results (registration, name, email, score_d, score_i, score_s, score_c, dominant_profile, completed_at)")
print("VALUES")
print(",\n".join(results_values))
print("ON CONFLICT DO NOTHING;")

print("\n\n-- LINK RESULTS")
print("UPDATE test_results SET participant_id = participants.id")
print("FROM participants WHERE test_results.registration = participants.registration")
print("AND test_results.participant_id IS NULL;")
