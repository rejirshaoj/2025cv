import cv2
import numpy as np
import os
from moviepy.editor import ImageSequenceClip
import random

def create_animation(input_dir, output_path, duration=15, descriptions=None):
    """
    将静态图片转换为动画效果
    
    参数:
    input_dir: 输入图片目录
    output_path: 输出视频路径
    duration: 视频时长(秒)
    descriptions: 图片描述文本列表，与图片顺序对应
    """
    # 获取所有图片文件
    image_files = [f for f in os.listdir(input_dir) 
                  if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    image_files.sort()  # 确保顺序一致
    
    if not image_files:
        raise ValueError("未找到图片文件")
    
    # 读取所有图片
    images = []
    for img_file in image_files:
        img_path = os.path.join(input_dir, img_file)
        img = cv2.imread(img_path)
        if img is not None:
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)  # 转换为RGB
            images.append(img)
    
    # 确保所有图片尺寸一致
    target_size = (1920, 1080)  # 1080p
    resized_images = []
    for img in images:
        resized = cv2.resize(img, target_size)
        resized_images.append(resized)
    
    # 创建动画帧
    fps = 30
    total_frames = duration * fps
    frames_per_image = total_frames // len(resized_images)
    extra_frames = total_frames % len(resized_images)
    
    all_frames = []
    
    for i in range(len(resized_images)):
        current_img = resized_images[i]
        next_img = resized_images[(i + 1) % len(resized_images)]
        
        # 获取当前图片的描述文本
        current_description = ""
        if descriptions and i < len(descriptions):
            current_description = descriptions[i]
        
        # 为当前图片分配帧数
        current_frames = frames_per_image
        if i < extra_frames:
            current_frames += 1
            
        # 创建从当前图片到下一张图片的过渡
        for j in range(current_frames):
            # 应用动画效果
            if j < current_frames - 10:  # 前部分帧使用缩放和平移效果
                # 随机选择效果: 放大、平移或两者结合
                effect = random.choice(['zoom', 'pan', 'both'])
                
                if effect in ['zoom', 'both']:
                    # 缩放效果
                    zoom_factor = 1.0 + (j / current_frames) * 0.1  # 最多放大10%
                    h, w = current_img.shape[:2]
                    zoomed = cv2.resize(current_img, None, fx=zoom_factor, fy=zoom_factor)
                    # 裁剪回原始尺寸
                    y_start = (zoomed.shape[0] - h) // 2
                    x_start = (zoomed.shape[1] - w) // 2
                    zoomed = zoomed[y_start:y_start+h, x_start:x_start+w]
                    frame = zoomed
                else:
                    frame = current_img.copy()
                
                if effect in ['pan', 'both']:
                    # 平移效果
                    h, w = frame.shape[:2]
                    max_offset = int(w * 0.05)  # 最多平移5%
                    x_offset = int((j / current_frames) * max_offset)
                    # 创建平移矩阵 - 修复类型错误
                    M = np.array([[1, 0, x_offset], [0, 1, 0]], dtype=np.float32)
                    frame = cv2.warpAffine(frame, M, (w, h))
            else:  # 最后10帧用于过渡到下一张图片
                alpha = (j - (current_frames - 10)) / 10.0
                frame = cv2.addWeighted(current_img, 1 - alpha, next_img, alpha, 0)
            
            # 添加文字描述
            if current_description:
                # 创建一个帧的副本，以便添加文字
                frame_with_text = frame.copy()
                
                # 设置文字参数
                font = cv2.FONT_HERSHEY_SIMPLEX
                font_scale = 1.2
                font_thickness = 2
                text_color = (255, 255, 255)  # 白色
                
                # 计算文字大小，以便居中显示
                text_size = cv2.getTextSize(current_description, font, font_scale, font_thickness)[0]
                
                # 计算文字位置（底部居中）
                text_x = (frame.shape[1] - text_size[0]) // 2
                text_y = frame.shape[0] - 50  # 距离底部50像素
                
                # 添加黑色背景使文字更清晰
                # 创建半透明黑色背景
                overlay = frame.copy()
                cv2.rectangle(overlay, 
                             (text_x - 20, text_y - text_size[1] - 10),
                             (text_x + text_size[0] + 20, text_y + 10),
                             (0, 0, 0), -1)
                
                # 将半透明背景应用到帧上
                alpha = 0.6
                frame_with_text = cv2.addWeighted(overlay, alpha, frame, 1 - alpha, 0)
                
                # 添加文字
                cv2.putText(frame_with_text, current_description, (text_x, text_y), 
                           font, font_scale, text_color, font_thickness, cv2.LINE_AA)
                
                frame = frame_with_text
            
            all_frames.append(frame)
    
    # 创建视频
    clip = ImageSequenceClip(all_frames, fps=fps)
    clip.write_videofile(output_path, codec='libx264')
    
    return output_path