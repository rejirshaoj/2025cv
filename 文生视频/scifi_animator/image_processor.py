import requests
import os
from dotenv import load_dotenv
import base64

# 加载环境变量
load_dotenv()

def generate_image_description(image_path):
    """
    使用OpenAI的API生成图片描述
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("未找到OpenAI API密钥，请在.env文件中设置OPENAI_API_KEY")
    
    # 读取并编码图片
    with open(image_path, "rb") as image_file:
        base64_image = base64.b64encode(image_file.read()).decode('utf-8')
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    payload = {
        "model": "gpt-4-vision-preview",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "这是一张科幻图片。请用富有想象力和史诗感的语言描述这张图片，限制在30-50个字之内。描述应该有未来感和科技感。"
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        "max_tokens": 100
    }
    
    response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
    
    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"].strip()
    else:
        print(f"API请求失败: {response.status_code}")
        print(response.text)
        return "一幅展现未来科技与宇宙奥秘的壮丽画面"  # 默认描述


# 在现有的image_processor.py文件中添加以下函数

def generate_image_from_text(text, output_path):
    """
    使用OpenAI的DALL-E API从文本生成图片
    
    参数:
    text: 用于生成图片的文本描述
    output_path: 输出图片路径
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("未找到OpenAI API密钥，请在.env文件中设置OPENAI_API_KEY")
    
    # 添加科幻风格的提示词
    prompt = f"科幻场景: {text} 高清，未来感，科技感，宇宙，太空，机器人，外星，未来城市"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    payload = {
        "model": "dall-e-3",
        "prompt": prompt,
        "n": 1,
        "size": "1024x1024"
    }
    
    response = requests.post("https://api.openai.com/v1/images/generations", headers=headers, json=payload)
    
    if response.status_code == 200:
        image_url = response.json()["data"][0]["url"]
        # 下载图片
        img_response = requests.get(image_url)
        if img_response.status_code == 200:
            with open(output_path, 'wb') as f:
                f.write(img_response.content)
            return output_path
        else:
            print(f"下载图片失败: {img_response.status_code}")
            print(img_response.text)
    else:
        print(f"生成图片API请求失败: {response.status_code}")
        print(response.text)
        raise Exception("生成图片失败")