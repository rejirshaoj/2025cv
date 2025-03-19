import os
import requests
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

def generate_narration(text, output_path, style='epic'):
    """
    使用TTS API生成配音
    
    参数:
    text: 要转换为语音的文本
    output_path: 输出音频文件路径
    style: 配音风格 ('epic', 'narrative', 'mysterious')
    """
    # 这里使用Azure TTS服务，也可以替换为其他TTS服务
    api_key = os.getenv("AZURE_TTS_KEY")
    region = os.getenv("AZURE_TTS_REGION", "eastus")
    
    if not api_key:
        raise ValueError("未找到Azure TTS API密钥，请在.env文件中设置AZURE_TTS_KEY")
    
    # 根据风格选择合适的声音和风格设置
    voice_settings = {
        'epic': {
            'voice': 'zh-CN-YunxiNeural',
            'style': 'newscast-formal',
            'rate': '+10%',
            'pitch': '-5%'
        },
        'narrative': {
            'voice': 'zh-CN-YunyangNeural',
            'style': 'narration-professional',
            'rate': '+5%',
            'pitch': '0%'
        },
        'mysterious': {
            'voice': 'zh-CN-XiaohanNeural',
            'style': 'mysterious',
            'rate': '-5%',
            'pitch': '-10%'
        }
    }
    
    settings = voice_settings.get(style, voice_settings['epic'])
    
    # 构建SSML
    ssml = f"""
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="zh-CN">
        <voice name="{settings['voice']}">
            <mstts:express-as style="{settings['style']}">
                <prosody rate="{settings['rate']}" pitch="{settings['pitch']}">
                    {text}
                </prosody>
            </mstts:express-as>
        </voice>
    </speak>
    """
    
    headers = {
        'Ocp-Apim-Subscription-Key': api_key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        'User-Agent': 'SciFiAnimator'
    }
    
    url = f"https://{region}.tts.speech.microsoft.com/cognitiveservices/v1"
    
    response = requests.post(url, headers=headers, data=ssml.encode('utf-8'))
    
    if response.status_code == 200:
        with open(output_path, 'wb') as audio_file:
            audio_file.write(response.content)
        return output_path
    else:
        print(f"TTS API请求失败: {response.status_code}")
        print(response.text)
        raise Exception("生成配音失败")