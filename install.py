import json
import subprocess
import sys
import platform

# Siz taqdim etgan JSON ma'lumotlari
package_data = """
{
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@editorjs/header": "^2.8.8",
    "@editorjs/inline-code": "^1.5.2",
    "@editorjs/list": "^2.0.9",
    "@editorjs/marker": "^1.4.0",
    "@editorjs/paragraph": "^2.11.7",
    "@editorjs/underline": "^1.2.1",
    "@google/genai": "^1.24.0",
    "@module-federation/nextjs-mf": "^8.8.41",
    "@monaco-editor/react": "^4.7.0",
    "@radix-ui/react-accordion": "^1.2.12",
    "@radix-ui/react-alert-dialog": "^1.1.15",
    "@radix-ui/react-checkbox": "^1.3.2",
    "@radix-ui/react-context-menu": "^2.2.16",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.15",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-progress": "^1.1.7",
    "@radix-ui/react-radio-group": "^1.3.7",
    "@radix-ui/react-scroll-area": "^1.2.9",
    "@radix-ui/react-select": "^2.2.5",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slider": "^1.3.5",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-switch": "^1.2.5",
    "@radix-ui/react-tabs": "^1.1.12",
    "@radix-ui/react-toggle": "^1.1.9",
    "@radix-ui/react-toggle-group": "^1.1.10",
    "@radix-ui/react-tooltip": "^1.2.7",
    "@radix-ui/react-visually-hidden": "^1.2.3",
    "@tanstack/react-query": "^5.83.0",
    "@tanstack/react-query-devtools": "^5.83.0",
    "@tisoap/react-flow-smart-edge": "^4.0.1",
    "axios": "^1.10.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "cross-env": "^10.1.0",
    "dagre": "^0.8.5",
    "date-fns": "^4.1.0",
    "framer-motion": "^12.23.24",
    "input-otp": "^1.4.2",
    "lucide-react": "^0.522.0",
    "mime": "^4.1.0",
    "monaco-editor": "^0.52.2",
    "monaco-editor-webpack-plugin": "^7.1.0",
    "monaco-vim": "^0.4.2",
    "motion": "^12.23.24",
    "motion-utils": "^12.23.6",
    "next": "15.3.4",
    "next-auth": "^4.24.11",
    "next-intl": "^4.3.4",
    "next-themes": "^0.4.6",
    "react": "^19.0.0",
    "react-countdown": "^2.3.6",
    "react-day-picker": "^9.11.1",
    "react-dom": "^19.0.0",
    "react-draggable": "^4.5.0",
    "react-hot-toast": "^2.6.0",
    "react-icons": "^5.5.0",
    "react-resizable-panels": "^3.0.6",
    "react-syntax-highlighter": "^15.6.1",
    "react-textarea-autosize": "^8.5.9",
    "reactflow": "^11.11.4",
    "sonner": "^2.0.6",
    "tailwind-merge": "^3.3.1",
    "use-debounce": "^10.0.5",
    "ws": "^8.18.3"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.1.17",
    "@types/dagre": "^0.7.53",
    "@types/node": "^20.19.21",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/react-syntax-highlighter": "^15.5.13",
    "@types/ws": "^8.18.1",
    "concurrently": "^9.2.0",
    "husky": "^9.1.7",
    "monaco-themes": "^0.4.8",
    "npm-run-all": "^4.1.5",
    "tailwindcss": "^4",
    "tw-animate-css": "^1.3.4",
    "typescript": "^5"
  }
}
"""

def install_libs():
    try:
        data = json.loads(package_data)
        
        # OS ni aniqlash (Windowsda .cmd kerak bo'lishi mumkin)
        is_windows = platform.system() == "Windows"
        pnpm_cmd = "pnpm.cmd" if is_windows else "pnpm"

        # 1. Oddiy dependencies (production)
        deps = list(data.get("dependencies", {}).keys())
        if deps:
            print(f"--- {len(deps)} ta dependency o'rnatilmoqda... ---")
            # Barcha kutubxonalarni bitta komandaga yig'amiz (tezroq ishlashi uchun)
            # Bu xuddi "pnpm install lib1 lib2 lib3" qilgandek ishlaydi
            cmd = [pnpm_cmd, "install"] + deps
            subprocess.run(cmd, shell=is_windows, check=True)
            print("Dependencies o'rnatildi.\n")

        # 2. DevDependencies (development)
        dev_deps = list(data.get("devDependencies", {}).keys())
        if dev_deps:
            print(f"--- {len(dev_deps)} ta devDependency o'rnatilmoqda... ---")
            # Bu xuddi "pnpm install -D lib1 lib2" qilgandek ishlaydi
            cmd = [pnpm_cmd, "install", "-D"] + dev_deps
            subprocess.run(cmd, shell=is_windows, check=True)
            print("DevDependencies o'rnatildi.\n")

        print("🎉 Barcha jarayonlar muvaffaqiyatli yakunlandi!")

    except json.JSONDecodeError:
        print("Xatolik: JSON formati noto'g'ri.")
    except subprocess.CalledProcessError as e:
        print(f"Xatolik: O'rnatish jarayonida xato yuz berdi. {e}")
    except FileNotFoundError:
        print("Xatolik: 'pnpm' topilmadi. Iltimos pnpm o'rnatilganligiga ishonch hosil qiling.")

if __name__ == "__main__":
    install_libs()
