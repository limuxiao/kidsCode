/**
 * 音效管理器 - 统一管理游戏中的所有音效和背景音乐
 */

export type SoundType = 'move' | 'turn' | 'attack' | 'victory';
export type MusicType = 'game-bg';

class SoundManager {
  private sounds: Map<SoundType, HTMLAudioElement> = new Map();
  private music: Map<MusicType, HTMLAudioElement> = new Map();
  private soundVolume: number = 0.7;
  private musicVolume: number = 0.3;
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private currentMusic: HTMLAudioElement | null = null;

  constructor() {
    this.initSounds();
    this.initMusic();
  }

  /**
   * 初始化所有音效
   */
  private initSounds() {
    const soundFiles: Record<SoundType, string> = {
      move: '/assets/sounds/move.mp3',
      turn: '/assets/sounds/turn.mp3',
      attack: '/assets/sounds/attack.mp3',
      victory: '/assets/sounds/victory.mp3'
    };

    Object.entries(soundFiles).forEach(([key, path]) => {
      const audio = new Audio(path);
      audio.volume = this.soundVolume;
      audio.preload = 'auto';
      this.sounds.set(key as SoundType, audio);
    });
  }

  /**
   * 初始化背景音乐
   */
  private initMusic() {
    const musicFiles: Record<MusicType, string> = {
      'game-bg': '/assets/music/game-bg.mp3'
    };

    Object.entries(musicFiles).forEach(([key, path]) => {
      const audio = new Audio(path);
      audio.volume = this.musicVolume;
      audio.loop = true;
      audio.preload = 'auto';
      this.music.set(key as MusicType, audio);
    });
  }

  /**
   * 播放音效
   */
  playSound(type: SoundType) {
    if (!this.soundEnabled) return;
    
    const sound = this.sounds.get(type);
    if (sound) {
      // 重置播放位置，允许快速连续播放
      sound.currentTime = 0;
      sound.play().catch(err => {
        console.warn(`Failed to play sound ${type}:`, err);
      });
    }
  }

  /**
   * 播放背景音乐
   */
  playMusic(type: MusicType) {
    if (!this.musicEnabled) return;

    // 停止当前音乐
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
    }

    const music = this.music.get(type);
    if (music) {
      this.currentMusic = music;
      music.play().catch(err => {
        console.warn(`Failed to play music ${type}:`, err);
      });
    }
  }

  /**
   * 停止背景音乐
   */
  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
      this.currentMusic = null;
    }
  }

  /**
   * 暂停背景音乐
   */
  pauseMusic() {
    if (this.currentMusic) {
      this.currentMusic.pause();
    }
  }

  /**
   * 恢复背景音乐
   */
  resumeMusic() {
    if (this.currentMusic && this.musicEnabled) {
      this.currentMusic.play().catch(err => {
        console.warn('Failed to resume music:', err);
      });
    }
  }

  /**
   * 设置音效音量 (0-1)
   */
  setSoundVolume(volume: number) {
    this.soundVolume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach(sound => {
      sound.volume = this.soundVolume;
    });
  }

  /**
   * 设置音乐音量 (0-1)
   */
  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.music.forEach(music => {
      music.volume = this.musicVolume;
    });
  }

  /**
   * 切换音效开关
   */
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    return this.soundEnabled;
  }

  /**
   * 切换音乐开关
   */
  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (!this.musicEnabled) {
      this.pauseMusic();
    } else {
      this.resumeMusic();
    }
    return this.musicEnabled;
  }

  /**
   * 获取当前音效状态
   */
  isSoundEnabled() {
    return this.soundEnabled;
  }

  /**
   * 获取当前音乐状态
   */
  isMusicEnabled() {
    return this.musicEnabled;
  }

  /**
   * 获取音效音量
   */
  getSoundVolume() {
    return this.soundVolume;
  }

  /**
   * 获取音乐音量
   */
  getMusicVolume() {
    return this.musicVolume;
  }
}

// 导出单例
export const soundManager = new SoundManager();
