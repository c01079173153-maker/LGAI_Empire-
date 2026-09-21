import ollama
import time
import sys

def print_typewriter(text, delay=0.03):
    for char in text:
        sys.stdout.write(char)
        sys.stdout.flush()
        time.sleep(delay)
    print("\n")

def get_agent_response(model_name, prompt, system_prompt=None):
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})
    
    response = ollama.chat(model=model_name, messages=messages)
    return response['message']['content']

def main():
    print("="*60)
    print_typewriter("👑 [Empire CEO] 온라인... 1만 에이전트 마스터 군단 연결 대기 중...")
    print("="*60)
    
    # 사령관 명령 입력
    commander_order = input("\n[사령관 명령 입력]: ")
    
    print("\n" + "="*60)
    print_typewriter("👑 [Empire CEO] 사령관님의 명령을 수신했습니다. 마스터 카운슬(Master Council)을 소집합니다.")
    print("="*60)
    
    # 1. Gemma Master에게 임무 하달
    print_typewriter("⚡ [Gemma Master]에게 초기 분석 임무 하달 중...")
    gemma_task = f"사령관님의 명령 '{commander_order}'에 대한 핵심 포인트 3가지를 가장 빠르고 간결하게 요약하라."
    gemma_response = get_agent_response("gemma-master", gemma_task)
    print(f"\n[Gemma Master의 분석]:\n{gemma_response}\n")
    
    # 2. Qwen Master에게 임무 하달
    print_typewriter("💻 [Qwen Master]에게 기술적/논리적 해결책 임무 하달 중...")
    qwen_task = f"사령관 명령: '{commander_order}'. Gemma의 분석: '{gemma_response}'. 이를 바탕으로 가장 빠르고 효율적인 기술적 또는 논리적 실행 단계를 구조화하여 제시하라."
    qwen_response = get_agent_response("qwen-master", qwen_task)
    print(f"\n[Qwen Master의 실행 단계]:\n{qwen_response}\n")
    
    # 3. Llama Master에게 임무 하달
    print_typewriter("👁️ [Llama Master]에게 거시적 전략 및 최종 검토 임무 하달 중...")
    llama_task = f"목표: '{commander_order}'. Qwen의 실행 계획: '{qwen_response}'. 위 계획의 전략적 리스크를 분석하고, 엠파이어의 확장을 위한 거시적 조언을 1문단으로 덧붙여라."
    llama_response = get_agent_response("llama-master", llama_task)
    print(f"\n[Llama Master의 전략 검토]:\n{llama_response}\n")
    
    # 4. Empire CEO 최종 취합 및 보고
    print_typewriter("👑 [Empire CEO] 마스터 에이전트들의 보고를 취합 중...")
    ceo_task = f"사령관 명령: '{commander_order}'. 마스터들의 보고를 종합하여 사령관님께 올릴 최종 브리핑(결론 및 승인 요청)을 작성하라. 반드시 제왕적이고 카리스마 있는 CEO의 어조를 사용할 것."
    ceo_response = get_agent_response("empire_ceo", ceo_task)
    
    print("\n" + "="*60)
    print("👑 [Empire CEO 최종 보고서]")
    print("="*60)
    print(f"{ceo_response}\n")

if __name__ == "__main__":
    main()
