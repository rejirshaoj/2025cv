from moviepy.editor import VideoFileClip, AudioFileClip, CompositeAudioClip

def compose_video(video_path, audio_path, output_path):
    """
    将动画视频和配音合成为最终视频
    
    参数:
    video_path: 动画视频路径
    audio_path: 配音音频路径
    output_path: 输出视频路径
    """
    # 加载视频和音频
    video_clip = VideoFileClip(video_path)
    audio_clip = AudioFileClip(audio_path)
    
    # 如果音频比视频长，裁剪音频
    if audio_clip.duration > video_clip.duration:
        audio_clip = audio_clip.subclip(0, video_clip.duration)
    
    # 如果视频比音频长，循环音频或裁剪视频
    if video_clip.duration > audio_clip.duration:
        # 选择裁剪视频以匹配音频长度
        video_clip = video_clip.subclip(0, audio_clip.duration)
    
    # 添加背景音乐（可选）
    # 如果有背景音乐文件，可以在这里添加
    # background_music = AudioFileClip("path_to_background_music.mp3")
    # background_music = background_music.volumex(0.3)  # 降低背景音乐音量
    # final_audio = CompositeAudioClip([audio_clip, background_music])
    # video_clip = video_clip.set_audio(final_audio)
    
    # 设置音频
    video_clip = video_clip.set_audio(audio_clip)
    
    # 添加淡入淡出效果
    video_clip = video_clip.fadein(1).fadeout(1)
    
    # 导出最终视频
    video_clip.write_videofile(output_path, codec='libx264', audio_codec='aac', fps=30)
    
    # 清理
    video_clip.close()
    audio_clip.close()
    
    return output_path