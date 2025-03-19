# 科幻图片动画化工具

这个工具可以将科幻图片转换为动画短片，并添加史诗感的配音叙述。支持从图片生成视频或直接从文字描述生成视频。

## 功能特点

- 分析科幻图片并生成描述文本
- 将静态图片转换为动画效果（缩放、平移等）
- 生成多种风格的配音（史诗、叙事、神秘）
- 支持直接从文字描述生成科幻图片和视频
- 在视频中添加文字说明
- 将所有元素合成为精美的短片

## 安装

1. 克隆此仓库
2. 安装依赖：
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
3. 在`.env`文件中设置API密钥：
OPENAI_API_KEY=your_openai_api_key_here
AZURE_TTS_KEY=your_azure_tts_key_here
AZURE_TTS_REGION=eastus

如果你在中国，可能会希望使用更接近的区域以获得更好的响应速度。Azure 在中国有以下区域可供选择：
AZURE_TTS_REGION=eastasia        # 东亚 (香港)
AZURE_TTS_REGION=southeastasia   # 东南亚 (新加坡)
如果你使用的是 Azure 中国版，则可以使用：
AZURE_TTS_REGION=chinaeast2      # 中国东部 2 (上海)
AZURE_TTS_REGION=chinanorth2     # 中国北部 2 (北京)


## 使用方法

### 从图片生成视频
python main.py --input_dir "图片目录路径" --output_dir "输出目录" --duration 15 --style epic

参数说明：
- `--input_dir`: 包含科幻图片的目录（必需）
- `--output_dir`: 输出视频的目录（默认为"output"）
- `--duration`: 视频时长，单位为秒（默认为15）
- `--style`: 配音风格，可选值为epic（史诗）、narrative（叙事）、mysterious（神秘）（默认为epic）

### 从文字直接生成视频
python main.py --text "你的科幻故事描述" --output_dir "输出目录" --style epic --num_images 5

参数说明：
- `--text`: 用于生成科幻图片和视频的文字描述（必需）
- `--output_dir`: 输出视频的目录（默认为"output"）
- `--style`: 配音风格（默认为epic）
- `--num_images`: 从文字生成的图片数量（默认为5）
- `--duration`: 视频时长，单位为秒（默认为15）

## 示例

### 从图片生成视频
python main.py --input_dir "e:\sci_fi_images" --output_dir "e:\output_videos" --style mysterious

### 从文字生成视频
python main.py --text "在2150年，人类探索太空的旅程达到了新高度。宇航员们发现了一颗蕴含神秘能量的行星。科学家们研发出能与外星文明沟通的量子通讯技术。" --output_dir "e:\output_videos" --style epic --num_images 3

## 项目结构

- `main.py`: 主程序入口
- `image_processor.py`: 图片处理和描述生成
- `animator.py`: 图片动画效果生成
- `audio_generator.py`: 语音合成
- `video_composer.py`: 视频合成

## 依赖项

- OpenCV: 图像处理
- NumPy: 数值计算
- MoviePy: 视频编辑
- Python-dotenv: 环境变量管理
- Requests: HTTP请求

## 注意事项

- 生成高质量视频需要较高的计算资源
- 请确保已安装ffmpeg，MoviePy依赖它进行视频处理
- 使用文字生成图片功能需要OpenAI API密钥
- 配音生成功能需要Azure TTS API密钥

## 许可证

MIT License