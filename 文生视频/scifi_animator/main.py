import os
import argparse
from image_processor import generate_image_description, generate_image_from_text
from animator import create_animation
from audio_generator import generate_narration
from video_composer import compose_video

def main():
    parser = argparse.ArgumentParser(description='将科幻图片转换为动画短片')
    parser.add_argument('--input_dir', type=str, help='输入图片目录')
    parser.add_argument('--output_dir', type=str, default='output', help='输出视频目录')
    parser.add_argument('--duration', type=int, default=15, help='视频时长(秒)')
    parser.add_argument('--style', type=str, default='epic', 
                        choices=['epic', 'narrative', 'mysterious'],
                        help='配音风格')
    parser.add_argument('--text', type=str, help='直接从文字生成视频的输入文本')
    parser.add_argument('--num_images', type=int, default=5, help='从文字生成的图片数量')
    args = parser.parse_args()
    
    # 创建输出目录
    os.makedirs(args.output_dir, exist_ok=True)
    
    # 从文字生成图片或使用现有图片
    if args.text:
        # 创建临时图片目录
        temp_img_dir = os.path.join(args.output_dir, "temp_images")
        os.makedirs(temp_img_dir, exist_ok=True)
        
        print(f"从文字生成 {args.num_images} 张图片...")
        
        # 将文本分割成多个部分，每部分生成一张图片
        text_parts = split_text_for_images(args.text, args.num_images)
        
        # 生成图片
        image_files = []
        for i, text_part in enumerate(text_parts):
            img_path = os.path.join(temp_img_dir, f"generated_image_{i+1}.jpg")
            generate_image_from_text(text_part, img_path)
            image_files.append(f"generated_image_{i+1}.jpg")
            print(f"已生成图片 {i+1}/{args.num_images}")
        
        # 使用生成的图片目录
        input_dir = temp_img_dir
        
        # 使用原始文本部分作为描述
        descriptions = text_parts
        
    else:
        # 使用提供的图片目录
        if not args.input_dir:
            print("错误: 必须提供--input_dir或--text参数")
            return
            
        input_dir = args.input_dir
        
        # 处理图片目录中的所有图片
        image_files = [f for f in os.listdir(input_dir) 
                      if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        
        if not image_files:
            print("未找到图片文件")
            return
        
        print(f"找到 {len(image_files)} 张图片，开始处理...")
        
        # 生成图片描述
        descriptions = []
        for img_file in image_files:
            img_path = os.path.join(input_dir, img_file)
            description = generate_image_description(img_path)
            descriptions.append(description)
            print(f"已生成图片描述: {img_file}")
    
    # 合并所有描述为一个连贯的叙事
    full_narrative = create_narrative(descriptions)
    print("生成的叙事文本:")
    print(full_narrative)
    
    # 生成配音
    audio_path = os.path.join(args.output_dir, "narration.mp3")
    generate_narration(full_narrative, audio_path, style=args.style)
    print(f"配音已生成: {audio_path}")
    
    # 创建动画
    animation_path = os.path.join(args.output_dir, "animation.mp4")
    create_animation(input_dir, animation_path, args.duration, descriptions)
    print(f"动画已生成: {animation_path}")
    
    # 合成最终视频
    output_path = os.path.join(args.output_dir, "final_video.mp4")
    compose_video(animation_path, audio_path, output_path)
    print(f"最终视频已生成: {output_path}")

def create_narrative(descriptions):
    """将多个图片描述合并为一个连贯的叙事"""
    # 简单示例 - 实际项目中可能需要更复杂的处理
    combined = "在遥远的未来，" + " ".join(descriptions)
    # 确保叙事不会太长，适合15秒视频
    if len(combined.split()) > 50:  # 假设每秒约3-4个词
        words = combined.split()
        combined = " ".join(words[:50]) + "..."
    return combined

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

if __name__ == "__main__":
    main()