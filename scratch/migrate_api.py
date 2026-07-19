import os
import re

files_to_process = [
    "infrastructure/auth/session.service.ts",
    "infrastructure/monitoring/audit.service.ts",
    "domains/community/api/forum.service.ts",
    "domains/organizations/api/organization.service.ts",
    "domains/publishing/api/creator.service.ts",
    "domains/identity/api/user.service.ts",
    "domains/identity/api/iam/role.service.ts",
    "domains/identity/api/iam/permission.service.ts",
    "app/(onboarding)/onboarding/page.tsx",
    "domains/channels/api/channel.service.ts",
    "domains/channels/api/channel-staff.service.ts"
]

def process_file(filepath):
    if not os.path.exists(filepath):
        print(f"Not found: {filepath}")
        return
        
    with open(filepath, 'r') as f:
        content = f.read()

    if 'apiClient' not in content:
        return

    # 1. Replace import
    content = content.replace("import { apiClient } from '@/infrastructure/http/apiClient';", "import { api } from '@/infrastructure/http/api';")
    
    # 2. Fix api routes (add /api/v1 to any path starting with / inside apiClient calls)
    # This requires looking for apiClient.method('/...') or apiClient.method(`/...`)
    content = re.sub(r"(apiClient\.(?:get|post|patch|put|delete)(?:<[^>]+>)?\()(['\"])((?!/api/v1)/.+?)(['\"])", r"\1\2/api/v1\3\4", content)
    content = re.sub(r"(apiClient\.(?:get|post|patch|put|delete)(?:<[^>]+>)?\()([`])((?!/api/v1)/.+?)([`])", r"\1\2/api/v1\3\4", content)

    # 3. Replace apiClient with api
    content = content.replace("apiClient.", "api.")

    # 4. Fix destructuring { data } to data
    # const { data } = await api.get
    content = re.sub(r"const\s+\{\s*data\s*\}\s*=\s*await\s+api\.", "const data = await api.", content)
    
    # const { data: alias } = await api.get
    content = re.sub(r"const\s+\{\s*data\s*:\s*([a-zA-Z0-9_]+)\s*\}\s*=\s*await\s+api\.", r"const \1 = await api.", content)

    with open(filepath, 'w') as f:
        f.write(content)
        
    print(f"Processed {filepath}")

for f in files_to_process:
    process_file(f)
