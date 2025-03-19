from flask import Flask, request, jsonify, send_file
import os
import sys
import tempfile
import uuid

# 添加父目录到路径，以便导入主程序
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from image_processor import generate_image_from_text, generate_image_description
from animator import create_animation
from audio_generator import generate_narration
from video_composer import compose_video

app = Flask(__name__, static_folder='.', static_url_path='')

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/generate', methods=['POST'])
def generate_video():
    # 检查请求数据的有效性
    if not request.is_json:
        return jsonify({
            'success': False,
            'error': '无效的请求格式，需要JSON数据'
        }), 400
    
    data = request.get_json()
    if data is None:
        return jsonify({
            'success': False,
            'error': '无效的JSON数据'
        }), 400
    
    mode = data.get('mode', 'text')  # 'text' 或 'images'
    
    # 创建临时目录存储文件
    temp_dir = tempfile.mkdtemp()
    output_dir = os.path.join(temp_dir, 'output')
    os.makedirs(output_dir, exist_ok=True)
    
    # 生成唯一ID
    job_id = str(uuid.uuid4())
    
    if mode == 'text':
        # 从文本生成视频
        text = data.get('text', '')
        num_images = data.get('numImages', 5)
        style = data.get('style', 'epic')
        duration = data.get('duration', 15)
        
        # 创建临时图片目录
        img_dir = os.path.join(temp_dir, 'images')
        os.makedirs(img_dir, exist_ok=True)
        
        # 将文本分割成多个部分
        text_parts = split_text_for_images(text, num_images)
        
        # 生成图片
        for i, text_part in enumerate(text_parts):
            img_path = os.path.join(img_dir, f"generated_image_{i+1}.jpg")
            generate_image_from_text(text_part, img_path)
        
        # 使用生成的图片创建视频
        animation_path = os.path.join(output_dir, f"{job_id}_animation.mp4")
        create_animation(img_dir, animation_path, duration, text_parts)
        
        # 生成配音
        audio_path = os.path.join(output_dir, f"{job_id}_narration.mp3")
        generate_narration(text, audio_path, style=style)
        
        # 合成最终视频
        final_video_path = os.path.join(output_dir, f"{job_id}_final.mp4")
        compose_video(animation_path, audio_path, final_video_path)
        
        return jsonify({
            'success': True,
            'jobId': job_id,
            'videoUrl': f'/api/videos/{job_id}'
        })
        
    elif mode == 'images':
        # 从上传的图片生成视频
        style = data.get('style', 'epic')
        duration = data.get('duration', 15)
        
        # 创建临时图片目录
        img_dir = os.path.join(temp_dir, 'images')
        os.makedirs(img_dir, exist_ok=True)
        
        # 保存上传的图片文件
        image_files = request.files.getlist('images')
        saved_images = []
        
        for i, image_file in enumerate(image_files):
            if image_file and allowed_file(image_file.filename):
                filename = f"uploaded_image_{i+1}.jpg"
                filepath = os.path.join(img_dir, filename)
                image_file.save(filepath)
                saved_images.append(filepath)
        
        if not saved_images:
            return jsonify({
                'success': False,
                'error': '未上传有效图片'
            }), 400
        
        # 生成图片描述
        descriptions = []
        for img_path in saved_images:
            description = generate_image_description(img_path)
            descriptions.append(description)
        
        # 创建叙事文本
        narrative = " ".join(descriptions)
        
        # 使用上传的图片创建视频
        animation_path = os.path.join(output_dir, f"{job_id}_animation.mp4")
        create_animation(img_dir, animation_path, duration, descriptions)
        
        # 生成配音
        audio_path = os.path.join(output_dir, f"{job_id}_narration.mp3")
        generate_narration(narrative, audio_path, style=style)
        
        # 合成最终视频
        final_video_path = os.path.join(output_dir, f"{job_id}_final.mp4")
        compose_video(animation_path, audio_path, final_video_path)
        
        return jsonify({
            'success': True,
            'jobId': job_id,
            'videoUrl': f'/api/videos/{job_id}'
        })
    
    else:
        return jsonify({
            'success': False,
            'error': '无效的模式'
        }), 400

@app.route('/api/videos/<job_id>', methods=['GET'])
def get_video(job_id):
    """获取生成的视频文件"""
    # 在实际应用中，应该从数据库或文件系统中查找视频
    # 这里简化处理，假设视频存储在临时目录中
    video_path = os.path.join(tempfile.gettempdir(), 'output', f"{job_id}_final.mp4")
    
    if os.path.exists(video_path):
        return send_file(video_path, mimetype='video/mp4', as_attachment=True, 
                         download_name=f"scifi_animation_{job_id}.mp4")
    else:
        return jsonify({
            'success': False,
            'error': '视频不存在或已过期'
        }), 404

@app.route('/api/upload', methods=['POST'])
def upload_images():
    """处理图片上传"""
    if 'images' not in request.files:
        return jsonify({
            'success': False,
            'error': '未找到上传的图片'
        }), 400
    
    # 创建临时目录
    temp_dir = tempfile.mkdtemp()
    img_dir = os.path.join(temp_dir, 'images')
    os.makedirs(img_dir, exist_ok=True)
    
    # 保存上传的图片
    image_files = request.files.getlist('images')
    saved_images = []
    
    for i, image_file in enumerate(image_files):
        if image_file and allowed_file(image_file.filename):
            filename = f"uploaded_image_{i+1}.jpg"
            filepath = os.path.join(img_dir, filename)
            image_file.save(filepath)
            saved_images.append({
                'id': i + 1,
                'path': filepath,
                'name': filename
            })
    
    return jsonify({
        'success': True,
        'images': saved_images
    })

def allowed_file(filename):
    """检查文件是否为允许的图片类型"""
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def split_text_for_images(text, num_parts):
    """将输入文本分割成多个部分，每部分用于生成一张图片"""
    # 简单按句子分割
    sentences = text.replace('。', '.').replace('！', '!').replace('？', '?').split('.')
    sentences = [s.strip() + '.' for s in sentences if s.strip()]
    
    # 如果句子数量少于请求的部分数量，则重复使用句子
    while len(sentences) < num_parts:
        sentences.extend(sentences[:num_parts-len(sentences)])
    
    # 如果句子数量多于请求的部分数量，则合并一些句子
    if len(sentences) > num_parts:
        # 计算每部分应包含的句子数
        sentences_per_part = len(sentences) // num_parts
        remainder = len(sentences) % num_parts
        
        parts = []
        start_idx = 0
        for i in range(num_parts):
            # 为前remainder个部分多分配一个句子
            count = sentences_per_part + (1 if i < remainder else 0)
            end_idx = start_idx + count
            parts.append(' '.join(sentences[start_idx:end_idx]))
            start_idx = end_idx
        
        return parts
    
    return sentences[:num_parts]

if __name__ == '__main__':
    # 创建必要的目录
    os.makedirs(os.path.join(tempfile.gettempdir(), 'output'), exist_ok=True)
    
    # 启动Flask应用
    app.run(debug=True, host='0.0.0.0', port=5000)