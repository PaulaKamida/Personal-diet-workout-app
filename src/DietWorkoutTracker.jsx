import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, X } from 'lucide-react';

// Vercel用の環境変数設定
const WEBHOOK_URL = '/api/save-record';

const DietWorkoutTracker = () => {
  const [selectedMeals, setSelectedMeals] = useState({ breakfast: '', lunch: '', dinner: '', snack: '' });
  const [weight, setWeight] = useState('');
  const [isPeriod, setIsPeriod] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentDay, setCurrentDay] = useState('');
  const [saving, setSaving] = useState(false);
  const [testMode, setTestMode] = useState(false);

// ✅ トースト（右上通知）
// ✅ トースト（自動クローズ＆手動クローズ対応）
const [toast, setToast] = useState(null); // { msg, type }
const toastTimerRef = useRef(null);

const showToast = (msg, type = 'success', duration = 4000) => {
  if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  setToast({ msg, type });
  toastTimerRef.current = setTimeout(() => setToast(null), duration);
};

const closeToast = () => {
  if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  setToast(null);
};

// ページ遷移・アンマウント時にタイマー掃除
useEffect(() => {
  return () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  };
}, []);

  useEffect(() => {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    if (!testMode) {
      const now = new Date();
      const jstDay = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
      setCurrentDay(days[jstDay.getDay()]);
    }
    
    // デバッグ用
    console.log('Webhook URL:', WEBHOOK_URL);
  }, [testMode]);

  const meals = {
    breakfast: [
      { id: 'A1', name: '和朝食セット', cal: 358, protein: 25, time: '15分',
        items: [
          { name: 'ご飯（茶碗小）', amount: '100g', cal: 168 },
          { name: '焼き鮭', amount: '50g', cal: 103, protein: 11 },
          { name: 'ゆで卵', amount: '1個', cal: 78, protein: 6 },
          { name: '味噌汁', amount: '1杯', cal: 30 },
          { name: '漬物', amount: '少量', cal: 10 }
        ],
        tip: 'バランスの良い和食。鮭は前日に焼いておくと楽' },
      { id: 'A2', name: 'たっぷり卵の朝食', cal: 350, protein: 28, time: '10分',
        items: [
          { name: 'ゆで卵', amount: '3個', cal: 234, protein: 19 },
          { name: 'バナナ', amount: '1本', cal: 105 },
          { name: '海苔', amount: '1枚', cal: 5 }
        ],
        tip: '週末に10個まとめて茹でて冷蔵保存すると便利' },
      { id: 'A3', name: 'ブラジル風チーズパン朝食', cal: 410, protein: 22, time: '20分',
        items: [
          { name: 'パォン・デ・ケイジョ', amount: '2個', cal: 220, protein: 8 },
          { name: 'スクランブルエッグ', amount: '卵2個', cal: 156, protein: 12 },
          { name: 'りんご', amount: '1個', cal: 95 }
        ],
        tip: 'コストコやカルディで入手可能。冷凍保存OK' },
      { id: 'A4', name: 'トースト＆プロテインセット', cal: 395, protein: 26, time: '10分',
        items: [
          { name: '全粒粉トースト', amount: '2枚', cal: 160 },
          { name: 'ゆで卵', amount: '2個', cal: 156, protein: 13 },
          { name: 'アボカド', amount: '1/4個', cal: 56 },
          { name: 'トマト', amount: '1個', cal: 18 }
        ],
        tip: '洋風で満足度高い。アボカドは脂質も補給' },
      { id: 'A5', name: '和風スムージーボウル', cal: 340, protein: 20, time: '5分',
        items: [
          { name: '豆乳', amount: '200ml', cal: 92, protein: 7 },
          { name: 'バナナ', amount: '1本', cal: 105 },
          { name: 'ほうれん草', amount: '30g', cal: 6 },
          { name: 'プロテインパウダー', amount: '15g', cal: 60, protein: 12 },
          { name: 'ゆで卵（添え）', amount: '1個', cal: 78, protein: 6 }
        ],
        tip: '超時短！ミキサーで混ぜるだけ' },
      { id: 'A6', name: 'さつまいも朝食', cal: 365, protein: 24, time: '15分',
        items: [
          { name: '焼きさつまいも', amount: '150g', cal: 203 },
          { name: 'ゆで卵', amount: '2個', cal: 156, protein: 12 },
          { name: 'りんご', amount: '1/2個', cal: 48 },
          { name: 'くるみ', amount: '5粒', cal: 46 }
        ],
        tip: '腹持ち抜群！さつまいもは週末にまとめて焼く' }
    ],
    lunch: [
      { id: 'B1', name: '鶏むね肉の照り焼き定食', cal: 570, protein: 42, time: '20分',
        items: [
          { name: '鶏むね肉の照り焼き', amount: '120g', cal: 198, protein: 37 },
          { name: 'ご飯（茶碗小）', amount: '140g', cal: 240 },
          { name: 'ブロッコリー茹で', amount: '100g', cal: 34 },
          { name: 'にんじんグラッセ', amount: '50g', cal: 20 },
          { name: '味噌汁', amount: '1杯', cal: 30 }
        ],
        tip: '日曜に鶏肉1kgを茹でて切り分け、照り焼きソースと和えて冷蔵（5日保存）' },
      { id: 'B2', name: 'サーモン丼', cal: 575, protein: 35, time: '10分',
        items: [
          { name: 'サーモン刺身', amount: '120g', cal: 247, protein: 26 },
          { name: 'ご飯', amount: '150g', cal: 257 },
          { name: 'アボカド', amount: '1/4個', cal: 56 },
          { name: 'きゅうり・わかめ', amount: '適量', cal: 15 }
        ],
        tip: 'スーパーのサーモン刺身パックで時短' },
      { id: 'B3', name: 'ブラジル風フェイジョアーダ', cal: 520, protein: 45, time: '30分',
        items: [
          { name: '黒豆の煮込み', amount: '150g', cal: 150, protein: 10 },
          { name: '豚ひき肉', amount: '80g', cal: 200, protein: 21 },
          { name: '鶏むね肉', amount: '50g', cal: 83, protein: 15 },
          { name: 'ご飯（茶碗小）', amount: '100g', cal: 168 },
          { name: 'トマト・玉ねぎ', amount: '適量', cal: 20 }
        ],
        tip: '黒豆缶（業務スーパー・カルディ）を活用すると簡単' },
      { id: 'B4', name: '豆腐ステーキ丼', cal: 515, protein: 54, time: '15分',
        items: [
          { name: '豆腐ステーキ（木綿豆腐）', amount: '300g', cal: 216, protein: 52 },
          { name: 'ご飯（茶碗小）', amount: '140g', cal: 240 },
          { name: 'ほうれん草ソテー', amount: '100g', cal: 60 }
        ],
        tip: '豆腐の水切りはレンジ3分でOK' },
      { id: 'B5', name: 'オーブン焼きポテト＆チキンプレート', cal: 545, protein: 40, time: '35分',
        items: [
          { name: '鶏むね肉ハーブグリル', amount: '120g', cal: 198, protein: 37 },
          { name: 'オーブン焼きポテト', amount: '200g', cal: 154 },
          { name: 'ブロッコリー・にんじんロースト', amount: '150g', cal: 80 },
          { name: 'オリーブオイル', amount: '小さじ2', cal: 83 }
        ],
        tip: 'じゃがいもをくし切りにし、200℃オーブンで30分。カリカリ！' },
      { id: 'B6', name: 'さつまいもフライ＆チキン', cal: 480, protein: 38, time: '30分',
        items: [
          { name: 'サラダチキン', amount: '125g', cal: 125, protein: 25 },
          { name: 'さつまいもフライ', amount: '150g', cal: 203 },
          { name: '野菜サラダ', amount: '適量', cal: 50 },
          { name: 'ゴマドレッシング', amount: '大さじ1', cal: 40 }
        ],
        tip: 'さつまいもスティック状、200℃オーブン25分。ポテト満足感！' },
      { id: 'B7', name: 'ブラジル風ピカーニャプレート', cal: 560, protein: 48, time: '20分',
        items: [
          { name: '牛もも肉グリル', amount: '120g', cal: 238, protein: 34 },
          { name: 'じゃがいも（茹で）', amount: '150g', cal: 115 },
          { name: 'ファロッファ風', amount: '20g', cal: 80 },
          { name: 'サラダ＋チミチュリソース', amount: '適量', cal: 70 }
        ],
        tip: 'チミチュリ：パセリ＋にんにく＋オリーブオイル＋酢' },
      { id: 'B8', name: '親子丼風', cal: 544, protein: 38, time: '15分',
        items: [
          { name: '鶏むね肉', amount: '100g', cal: 165, protein: 31 },
          { name: '卵', amount: '1個', cal: 78, protein: 6 },
          { name: 'ご飯（茶碗小）', amount: '140g', cal: 240 },
          { name: '玉ねぎ・三つ葉', amount: '適量', cal: 20 }
        ],
        tip: '定番和食で安心。だし・醤油・みりんで味付け' }
    ],
    dinner: [
      { id: 'C1', name: '豆腐とひき肉のハンバーグセット', cal: 520, protein: 57, time: '25分',
        items: [
          { name: '豆腐ひき肉ハンバーグ', amount: '豚肉60g+豆腐100g', cal: 222, protein: 28 },
          { name: 'ご飯（茶碗小）', amount: '140g', cal: 240 },
          { name: 'ブロッコリー・にんじん温野菜', amount: '適量', cal: 60 },
          { name: 'ゆで卵', amount: '1個', cal: 78, protein: 6 }
        ],
        tip: '満足度高いメインディッシュ' },
      { id: 'C2', name: 'サーモンのホイル焼き定食', cal: 517, protein: 48, time: '25分',
        items: [
          { name: 'サーモンホイル焼き', amount: '120g', cal: 247, protein: 26 },
          { name: 'さつまいも', amount: '150g', cal: 203 },
          { name: 'ほうれん草・にんじんソテー', amount: '200g', cal: 80 },
          { name: '白ごま', amount: '大さじ1', cal: 53, protein: 2 },
          { name: '味噌汁', amount: '1杯', cal: 30 }
        ],
        tip: 'サーモン・野菜・レモン・バターをアルミホイルで包み、200℃オーブン20分' },
      { id: 'C3', name: 'ブラジル風チキンライス', cal: 580, protein: 45, time: '30分',
        items: [
          { name: '鶏もも肉（皮なし）', amount: '100g', cal: 116, protein: 19 },
          { name: 'トマトライス', amount: '150g', cal: 270 },
          { name: '黒豆', amount: '100g', cal: 100, protein: 7 },
          { name: 'サラダ', amount: '適量', cal: 50 },
          { name: 'オリーブオイル', amount: '小さじ1', cal: 41 }
        ],
        tip: 'ご飯をトマトペースト・にんにく・玉ねぎと一緒に炊く' },
      { id: 'C4', name: 'じゃがいもグラタン＆チキン', cal: 530, protein: 50, time: '40分',
        items: [
          { name: '鶏むね肉グリル', amount: '120g', cal: 198, protein: 37 },
          { name: 'じゃがいもグラタン', amount: '150g+豆乳+チーズ', cal: 250 },
          { name: 'ブロッコリー', amount: '100g', cal: 34 },
          { name: 'サラダ', amount: '適量', cal: 50 }
        ],
        tip: 'スライスじゃがいもを豆乳で煮て、チーズ少量でオーブン焼き' },
      { id: 'C5', name: '豚ひき肉と野菜の炒め物', cal: 484, protein: 54, time: '20分',
        items: [
          { name: '豚ひき肉', amount: '80g', cal: 200, protein: 21 },
          { name: '豆腐', amount: '100g', cal: 72, protein: 17 },
          { name: 'さつまいも', amount: '100g', cal: 135 },
          { name: 'ブロッコリー・にんじん・ピーマン', amount: '適量', cal: 60 },
          { name: 'オリーブオイル', amount: '小さじ1', cal: 41 }
        ],
        tip: '野菜たっぷりでヘルシー' },
      { id: 'C6', name: 'フライドポテト風ディナー', cal: 595, protein: 52, time: '35分',
        items: [
          { name: '鶏むね肉グリル', amount: '150g', cal: 248, protein: 46 },
          { name: 'オーブンフライドポテト', amount: '250g', cal: 193 },
          { name: 'サラダチキン追加', amount: '50g', cal: 50, protein: 10 },
          { name: 'コールスロー', amount: '適量', cal: 80 },
          { name: 'オリーブオイル', amount: '小さじ2', cal: 83 }
        ],
        tip: 'じゃがいもフライドポテト形、220℃オーブン35分。途中裏返す' },
      { id: 'C7', name: 'ブラジル風ミックスグリル', cal: 570, protein: 55, time: '25分',
        items: [
          { name: '鶏むね肉', amount: '80g', cal: 132, protein: 25 },
          { name: '豚ロース', amount: '50g', cal: 118, protein: 10 },
          { name: 'ソーセージ', amount: '1本', cal: 90, protein: 5 },
          { name: 'ご飯（茶碗小）', amount: '100g', cal: 168 },
          { name: 'グリル野菜', amount: '適量', cal: 60 }
        ],
        tip: 'シュラスコ風。塩とにんにくで下味をつけてグリル' },
      { id: 'C8', name: '鮭の塩焼き和定食', cal: 465, protein: 48, time: '20分',
        items: [
          { name: '鮭の塩焼き', amount: '120g', cal: 247, protein: 26 },
          { name: 'ご飯（茶碗小）', amount: '120g', cal: 206 },
          { name: 'キャベツの千切り', amount: '適量', cal: 15 },
          { name: '豆腐の味噌汁', amount: '豆腐50g', cal: 40, protein: 4 },
          { name: '漬物', amount: '少量', cal: 10 }
        ],
        tip: '定番和食で安心' }
    ],
    snack: [
      { id: 'D1', name: 'アーモンドスナック', cal: 164, protein: 6, time: '0分',
        items: [{ name: 'アーモンド', amount: '28g（約23粒）', cal: 164, protein: 6 }],
        tip: '小袋に分けておくと食べ過ぎ防止' },
      { id: 'D2', name: 'ゆで卵＆果物', cal: 173, protein: 7, time: '0分',
        items: [
          { name: 'ゆで卵', amount: '1個', cal: 78, protein: 6 },
          { name: 'りんご', amount: '1個', cal: 95 }
        ],
        tip: 'バランス良し' },
      { id: 'D3', name: '枝豆ボウル', cal: 122, protein: 11, time: '3分',
        items: [{ name: '冷凍枝豆', amount: '100g', cal: 122, protein: 11 }],
        tip: 'レンジ3分、塩を振るだけ' },
      { id: 'D4', name: 'プロテインスナック', cal: 110, protein: 20, time: '0分',
        items: [{ name: 'プロテインバー', amount: '1本', cal: 110, protein: 20 }],
        tip: 'inバー プロテイン、1本満足バーがおすすめ' },
      { id: 'D5', name: '焼きさつまいもスナック', cal: 135, protein: 2, time: '0分',
        items: [{ name: '焼きさつまいも', amount: '100g', cal: 135 }],
        tip: 'フライドポテト欲求を満たす最高の代替品！' }
    ]
  };

  const workouts = {
    '日': { 
      normal: '🧘 ストレッチ（15-20分）', 
      period: '🧘 ストレッチ',
      equipment: ['ヨガマット'],
      periodEquipment: ['ヨガマット'],
      exercises: [
        { name: 'チャイルドポーズ', time: '2分', sets: '-', reps: '-', note: '正座から前に倒れ、腕を伸ばす' },
        { name: 'キャットカウ', time: '-', sets: '-', reps: '10回', note: '四つん這いで背中を丸める・反らす' },
        { name: 'ハムストリングストレッチ', time: '1分×2', sets: '2', reps: '-', note: '座って前屈、裏ももを伸ばす' },
        { name: 'ヒップフレクサー', time: '1分/側', sets: '-', reps: '-', note: 'ランジ姿勢で股関節を伸ばす' },
        { name: '肩甲骨ストレッチ', time: '1分', sets: '-', reps: '-', note: '両手を組んで前に伸ばす' },
        { name: '開脚前屈', time: '2分', sets: '-', reps: '-', note: '座って足を開き前屈' },
        { name: '仰向けツイスト', time: '1分/側', sets: '-', reps: '-', note: '仰向けで膝を横に倒す' },
        { name: 'シャバーサナ', time: '3分', sets: '-', reps: '-', note: '仰向けで完全リラックス' }
      ],
      periodExercises: [
        { name: 'チャイルドポーズ', time: '2分', sets: '-', reps: '-', note: '正座から前に倒れ、腕を伸ばす' },
        { name: 'キャットカウ', time: '-', sets: '-', reps: '10回', note: '四つん這いで背中を丸める・反らす' },
        { name: 'ハムストリングストレッチ', time: '1分×2', sets: '2', reps: '-', note: '座って前屈、裏ももを伸ばす' },
        { name: 'ヒップフレクサー', time: '1分/側', sets: '-', reps: '-', note: 'ランジ姿勢で股関節を伸ばす' },
        { name: '肩甲骨ストレッチ', time: '1分', sets: '-', reps: '-', note: '両手を組んで前に伸ばす' },
        { name: '開脚前屈', time: '2分', sets: '-', reps: '-', note: '座って足を開き前屈' },
        { name: '仰向けツイスト', time: '1分/側', sets: '-', reps: '-', note: '仰向けで膝を横に倒す' },
        { name: 'シャバーサナ', time: '3分', sets: '-', reps: '-', note: '仰向けで完全リラックス' }
      ]
    },
    '月': { 
      normal: '🏊 水泳A（30-40分）', 
      period: '🚶 室内ウォーキング30分',
      equipment: ['水着', '水泳キャップ', 'ゴーグル'],
      periodEquipment: ['運動靴（任意）'],
      exercises: [
        { name: 'ウォームアップ', distance: '200m', stroke: 'クロール', pace: 'ゆっくり', rest: '100m毎30秒' },
        { name: 'メインセット', distance: '400m', stroke: 'クロール', pace: '中ペース', rest: '100m毎30秒' },
        { name: 'クールダウン', distance: '200m', stroke: 'クロールor平泳ぎ', pace: 'ゆっくり', rest: '100m毎30秒' }
      ],
      periodExercises: [
        { name: 'ウォームアップ', time: '5分', note: 'ゆっくり足踏みまたは歩く' },
        { name: 'メイン', time: '20分', note: '中ペースで歩く、腕を振る' },
        { name: 'クールダウン', time: '5分', note: 'ゆっくり歩いてリラックス' }
      ],
      note: '合計800m / 覚え方：2-4-2',
      periodNote: '音楽を聴きながらリラックスして。部屋の中を歩くだけでOK'
    },
    '火': { 
      normal: '💪 筋トレA（30分）', 
      period: '💪 軽い筋トレ20分',
      equipment: ['ヨガマット', 'ダンベル4kg×2', '椅子'],
      periodEquipment: ['ヨガマット', 'ダンベル2kg×2'],
      exercises: [
        { name: 'ゴブレットスクワット', sets: '3', reps: '12', weight: '4kg', rest: '60秒', target: '下半身全体' },
        { name: 'ダンベルローイング', sets: '3', reps: '12/腕', weight: '4kg', rest: '60秒', target: '背中' },
        { name: 'ショルダープレス', sets: '3', reps: '10', weight: '4kg', rest: '60秒', target: '肩' },
        { name: 'グルートブリッジ', sets: '3', reps: '15', weight: '自重', rest: '45秒', target: 'お尻' },
        { name: 'プランク', sets: '3', reps: '30秒', weight: '-', rest: '45秒', target: '体幹' }
      ],
      periodExercises: [
        { name: 'グルートブリッジ', sets: '2', reps: '12', weight: '自重', rest: '60秒', target: 'お尻' },
        { name: 'ダンベルローイング', sets: '2', reps: '10/腕', weight: '2kg', rest: '60秒', target: '背中' },
        { name: 'ショルダープレス', sets: '2', reps: '8', weight: '2kg', rest: '60秒', target: '肩' },
        { name: 'プランク', sets: '2', reps: '20秒', weight: '-', rest: '45秒', target: '体幹' }
      ],
      periodNote: 'いつもの50-60%の強度。腹部に圧力がかかる動作は避ける。体調が悪ければすぐに中止'
    },
    '水': { 
      normal: '🌿 休養', 
      period: '🌿 休養',
      equipment: [],
      periodEquipment: [],
      exercises: [
        { name: '完全休養日', note: '体を休めて回復に専念。軽い散歩（20分）はOK' }
      ],
      periodExercises: [
        { name: '完全休養日', note: '体を休めて回復に専念。無理は禁物' }
      ]
    },
    '木': { 
      normal: '🏊 水泳B（35-45分）', 
      period: '🧘 ストレッチ＆ヨガ30分',
      equipment: ['水着', '水泳キャップ', 'ゴーグル'],
      periodEquipment: ['ヨガマット'],
      exercises: [
        { name: 'ウォームアップ', distance: '200m', stroke: 'クロール', pace: 'ゆっくり', rest: '100m毎30秒' },
        { name: 'メイン1', distance: '200m', stroke: 'クロール', pace: '中ペース', rest: '100m毎30秒' },
        { name: 'メイン2', distance: '200m', stroke: '平泳ぎ', pace: '中ペース', rest: '100m毎30秒' },
        { name: 'メイン3', distance: '100m', stroke: 'クロール', pace: '中ペース', rest: '50m毎30秒' },
        { name: 'クールダウン', distance: '200m', stroke: '平泳ぎ', pace: 'ゆっくり', rest: '100m毎30秒' }
      ],
      periodExercises: [
        { name: 'チャイルドポーズ', time: '2分', note: 'リラックス' },
        { name: 'キャットカウ', reps: '10回', note: '背中・腰' },
        { name: 'ハムストリング', time: '1分×2', note: '裏もも' },
        { name: 'ヒップフレクサー', time: '1分/側', note: '股関節' },
        { name: '肩甲骨ストレッチ', time: '1分', note: '肩こり改善' },
        { name: '開脚ストレッチ', time: '2分', note: '内もも' },
        { name: '仰向けツイスト', time: '1分/側', note: '腰・脇腹' }
      ],
      note: '合計900m / クロールと平泳ぎのミックス',
      periodNote: 'YouTubeで「初心者ヨガ 15分 生理」を検索。B-life、まりこチャンネルがおすすめ'
    },
    '金': { 
      normal: '💪 筋トレB（30分）', 
      period: '💪 軽い筋トレ20分',
      equipment: ['ヨガマット', 'ダンベル2kg×2', 'ダンベル4kg×1'],
      periodEquipment: ['ヨガマット', 'ダンベル2kg×2'],
      exercises: [
        { name: 'ダンベルランジ', sets: '3', reps: '10/脚', weight: '2kg', rest: '60秒', target: '下半身' },
        { name: 'ダンベルチェストプレス', sets: '3', reps: '12', weight: '2kg×2', rest: '60秒', target: '胸' },
        { name: 'ルーマニアンデッドリフト', sets: '3', reps: '12', weight: '4kg', rest: '60秒', target: '裏もも・お尻' },
        { name: 'ダンベルサイドベント', sets: '3', reps: '15/側', weight: '2kg', rest: '45秒', target: '脇腹' },
        { name: 'バードドッグ', sets: '3', reps: '10/側', weight: '自重', rest: '45秒', target: '体幹' }
      ],
      periodExercises: [
        { name: 'グルートブリッジ', sets: '2', reps: '12', weight: '自重', rest: '60秒', target: 'お尻' },
        { name: 'ダンベルチェストプレス', sets: '2', reps: '10', weight: '2kg×2', rest: '60秒', target: '胸' },
        { name: 'ダンベルサイドベント', sets: '2', reps: '12/側', weight: '2kg', rest: '45秒', target: '脇腹' },
        { name: 'バードドッグ', sets: '2', reps: '8/側', weight: '自重', rest: '45秒', target: '体幹' }
      ],
      periodNote: 'いつもの50-60%の強度。体調が悪ければ完全休養を選択'
    },
    '土': { 
      normal: '🏊 水泳C（40-50分）', 
      period: '🚶 室内ウォーキング30分',
      equipment: ['水着', '水泳キャップ', 'ゴーグル'],
      periodEquipment: ['運動靴（任意）'],
      exercises: [
        { name: '自由に泳ぐ', distance: '1,000m', stroke: 'クロール＋平泳ぎ自由', pace: '好きなペース', rest: '100m毎30秒、疲れたら50m毎' }
      ],
      periodExercises: [
        { name: 'ウォームアップ', time: '5分', note: 'ゆっくり足踏みまたは歩く' },
        { name: 'メイン', time: '20分', note: '中ペースで歩く、腕を振る' },
        { name: 'クールダウン', time: '5分', note: 'ゆっくり歩いてリラックス' }
      ],
      note: '距離やタイムを気にせず、水泳を楽しむ日',
      periodNote: '音楽を聴きながらリラックスして。無理は禁物'
    }
  };

  const calcTotal = () => {
    let cal = 0, prot = 0;
    Object.entries(selectedMeals).forEach(([cat, id]) => {
      if (id) {
        const meal = meals[cat].find(m => m.id === id);
        if (meal) { cal += meal.cal; prot += meal.protein; }
      }
    });
    return { cal, prot };
  };

  const handleSave = async () => {
  if (saving) return; // 二重送信防止

  // ① 先にデータ検証（ここで落ちたら早期return）
  if (!weight) {
    showToast('体重を入力してください', 'warn');
    return;
  }

  const weightNum = parseFloat(weight);
  if (!Number.isFinite(weightNum) || weightNum <= 0 || weightNum > 300) {
    showToast('正しい体重を入力してください（1-300kg）', 'warn');
    return;
  }

  const hasAnyMeal = Object.values(selectedMeals).some(meal => meal);
  if (!hasAnyMeal) {
    showToast('少なくとも1つの食事を選択してください', 'warn');
    return;
  }

  const { cal, prot } = calcTotal();
  if (cal < 800 || cal > 2500) {
    const confirmed = window.confirm(
      `カロリーが${cal < 800 ? '低すぎます' : '高すぎます'}（${cal}kcal）。このまま保存しますか？`
    );
    if (!confirmed) return;
  }

  // ② ここから「保存中」表示を開始
  setSaving(true);
  showToast('💾 保存中...', 'warn', 10000); // 保存中はやや長め

  try {
    const record = {
      date: new Date().toISOString().split('T')[0],
      weight: weightNum,
      calories: cal,
      protein: prot,
      breakfast: selectedMeals.breakfast,
      lunch: selectedMeals.lunch,
      dinner: selectedMeals.dinner,
      snack: selectedMeals.snack,
      isPeriod,
    };

    // ローカル保存
    const stored = localStorage.getItem('dietRecords');
    const existingRecords = stored ? JSON.parse(stored) : [];
    const updated = [...existingRecords, record];
    localStorage.setItem('dietRecords', JSON.stringify(updated));

    // Webhook送信（タイムアウト10秒）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      console.log('Sending to webhook:', WEBHOOK_URL);
      console.log('Data:', record);

      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(record),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Webhook error:', res.status, errorText);
        showToast(`⚠️ Webhook送信エラー (${res.status})`, 'error');
      } else {
        const responseData = await res.json().catch(() => ({}));
        console.log('Webhook success:', responseData);
        showToast('✅ 保存＆Webhook送信完了！', 'success');
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.error('Webhook error details:', e);

      if (e.name === 'AbortError') {
        showToast('⚠️ Webhook送信がタイムアウトしました', 'warn');
      } else if (e.message?.includes('Failed to fetch')) {
        showToast('⚠️ ネットワークエラー（CORSの可能性）', 'error');
      } else {
        showToast(`⚠️ 送信エラー: ${e.message}`, 'error');
      }
    }  
  } finally {
    setSaving(false);
  }
};


  const copyToCraft = () => {
    const { cal, prot } = calcTotal();
    const getMeal = (cat, id) => {
      if (!id) return '未選択';
      const m = meals[cat].find(x => x.id === id);
      return m ? `${m.id}. ${m.name}（${m.cal}kcal, ${m.protein}g）` : '未選択';
    };
    const status = cal >= 1400 && cal <= 1600 ? '✅範囲内' : cal < 1400 ? '⚠️低い' : '❌高い';
    const workout = workouts[currentDay] ? (isPeriod ? workouts[currentDay].period : workouts[currentDay].normal) : '';
    const text = `【${new Date().toLocaleDateString('ja-JP')}（${currentDay}）】\n\n🍽️ 食事：\n朝：${getMeal('breakfast', selectedMeals.breakfast)}\n昼：${getMeal('lunch', selectedMeals.lunch)}\n間食：${getMeal('snack', selectedMeals.snack)}\n夕：${getMeal('dinner', selectedMeals.dinner)}\n\n合計：${cal}kcal、${prot}g ${status}\n体重：${weight}kg\n\n💪 運動：${workout}\n${isPeriod ? '🩸 生理中\n' : ''}\n💧 水分：\n😊 気分：\n📝 メモ：`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { cal: totalCal, prot: totalProt } = calcTotal();
  const isInRange = totalCal >= 1400 && totalCal <= 1600;

  // 現在の運動データを取得（生理中かどうかで切り替え）
  const getCurrentExercises = () => {
    if (!workouts[currentDay]) return [];
    return isPeriod ? workouts[currentDay].periodExercises : workouts[currentDay].exercises;
  };

  const currentExercises = getCurrentExercises();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-light">My Personal Tracker</h1>
            <button 
              onClick={() => setTestMode(!testMode)} 
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              {testMode ? '🔧 テストモード' : '📅 通常モード'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-light">
                  {new Date().getMonth() + 1}月{new Date().getDate()}日（{currentDay}）
                </h2>
                {testMode && (
                  <div className="mt-3 flex gap-2">
                    {['日', '月', '火', '水', '木', '金', '土'].map(day => (
                      <button 
                        key={day} 
                        onClick={() => setCurrentDay(day)} 
                        className={`px-3 py-1 text-sm rounded-lg transition ${
                          currentDay === day 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">生理中</span>
                <button 
                  onClick={() => setIsPeriod(!isPeriod)} 
                  className={`relative w-11 h-6 rounded-full transition ${
                    isPeriod ? 'bg-pink-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    isPeriod ? 'translate-x-5' : ''
                  }`} />
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-700 mb-2">体重 (kg)</label>
              <input 
                type="number" 
                step="0.1" 
                value={weight} 
                onChange={(e) => setWeight(e.target.value)} 
                placeholder="00.0" 
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h3 className="font-medium mb-2">💪 今日の運動</h3>
              <p className="text-blue-900 mb-3">
                {workouts[currentDay] ? (isPeriod ? workouts[currentDay].period : workouts[currentDay].normal) : ''}
              </p>
              <p className="text-sm text-gray-600 mb-3">
                {workouts[currentDay] ? (isPeriod ? workouts[currentDay].periodNote : workouts[currentDay].note) : ''}
              </p>
              
              {currentExercises && currentExercises.length > 0 && (
                <div className="mt-4 bg-white rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-blue-100">
                      <tr>
                        <th className="px-3 py-2 text-left text-gray-700 font-medium">種目</th>
                        {currentExercises[0].sets !== undefined && <th className="px-3 py-2 text-center text-gray-700 font-medium">セット</th>}
                        {currentExercises[0].reps !== undefined && <th className="px-3 py-2 text-center text-gray-700 font-medium">回数</th>}
                        {currentExercises[0].distance !== undefined && <th className="px-3 py-2 text-center text-gray-700 font-medium">距離</th>}
                        {currentExercises[0].time !== undefined && <th className="px-3 py-2 text-center text-gray-700 font-medium">時間</th>}
                        {currentExercises[0].weight !== undefined && <th className="px-3 py-2 text-center text-gray-700 font-medium">重量</th>}
                        {currentExercises[0].rest !== undefined && <th className="px-3 py-2 text-center text-gray-700 font-medium">休憩</th>}
                        {currentExercises[0].stroke !== undefined && <th className="px-3 py-2 text-center text-gray-700 font-medium">泳法</th>}
                        {currentExercises[0].pace !== undefined && <th className="px-3 py-2 text-center text-gray-700 font-medium">ペース</th>}
                        {currentExercises[0].target !== undefined && <th className="px-3 py-2 text-center text-gray-700 font-medium">対象</th>}
                        {currentExercises[0].note !== undefined && <th className="px-3 py-2 text-center text-gray-700 font-medium">メモ</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {currentExercises.map((ex, i) => (
                        <tr key={i} className="border-t border-blue-100">
                          <td className="px-3 py-2 text-gray-800">{ex.name}</td>
                          {ex.sets !== undefined && <td className="px-3 py-2 text-center text-gray-600">{ex.sets}</td>}
                          {ex.reps !== undefined && <td className="px-3 py-2 text-center text-gray-600">{ex.reps}</td>}
                          {ex.distance !== undefined && <td className="px-3 py-2 text-center text-gray-600">{ex.distance}</td>}
                          {ex.time !== undefined && <td className="px-3 py-2 text-center text-gray-600">{ex.time}</td>}
                          {ex.weight !== undefined && <td className="px-3 py-2 text-center text-gray-600">{ex.weight}</td>}
                          {ex.rest !== undefined && <td className="px-3 py-2 text-center text-gray-600 text-xs">{ex.rest}</td>}
                          {ex.stroke !== undefined && <td className="px-3 py-2 text-center text-gray-600 text-xs">{ex.stroke}</td>}
                          {ex.pace !== undefined && <td className="px-3 py-2 text-center text-gray-600 text-xs">{ex.pace}</td>}
                          {ex.target !== undefined && <td className="px-3 py-2 text-center text-gray-600 text-xs">{ex.target}</td>}
                          {ex.note !== undefined && <td className="px-3 py-2 text-center text-gray-600 text-xs">{ex.note}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>  
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {Object.entries({ 
              breakfast: '🌅 朝食', 
              lunch: '🍱 昼食', 
              dinner: '🌙 夕食', 
              snack: '🍎 間食' 
            }).map(([cat, title]) => (
              <div key={cat} className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-medium mb-3">{title}</h3>
                <select 
                  value={selectedMeals[cat]} 
                  onChange={(e) => setSelectedMeals(prev => ({ ...prev, [cat]: e.target.value }))} 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-3 transition"
                >
                  <option value="">選択してください</option>
                  {meals[cat].map(m => (
                    <option key={m.id} value={m.id}>
                      {m.id}. {m.name} ({m.cal}kcal)
                    </option>
                  ))}
                </select>
                {selectedMeals[cat] && (() => {
                  const meal = meals[cat].find(m => m.id === selectedMeals[cat]);
                  return meal && (
                    <div className="bg-gray-50 rounded-lg p-4 mt-3">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-gray-700">📋 材料と栄養</p>
                        <p className="text-xs text-gray-500">⏱️ {meal.time}</p>
                      </div>
                      <div className="space-y-1">
                        {meal.items.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-sm py-1 border-b border-gray-200 last:border-0">
                            <span className="text-gray-700">
                              {item.name} <span className="text-gray-500">({item.amount})</span>
                            </span>
                            <div className="flex gap-3 text-xs">
                              <span className="text-gray-600">{item.cal}kcal</span>
                              {item.protein && <span className="text-blue-600 font-medium">{item.protein}g</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                      {meal.tip && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-600">💡 {meal.tip}</p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-medium mb-4">📊 今日のサマリー</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className={`p-4 rounded-lg transition ${isInRange ? 'bg-green-50' : 'bg-yellow-50'}`}>
                <p className="text-sm text-gray-600">カロリー</p>
                <p className="text-2xl font-bold">{totalCal}</p>
                <p className="text-xs text-gray-500">目標: 1,400-1,600</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">タンパク質</p>
                <p className="text-2xl font-bold">{totalProt}g</p>
                <p className="text-xs text-gray-500">目標: 120-140g</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">体重</p>
                <p className="text-2xl font-bold">{weight || '--'}kg</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
       <button
  onClick={handleSave}
  disabled={saving}
  className={`flex-1 py-3 rounded-lg transition font-medium text-white
    ${saving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
>
  {saving ? '保存中…' : '💾 保存する'}
</button>
            <button 
              onClick={copyToCraft} 
              className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition font-medium flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" /> 
                  コピー完了
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" /> 
                  Craftにコピー
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    {/* ✅ トースト（右上）: クリックで閉じる */}
{toast && (
  <div
    onClick={closeToast}
    className={`
      fixed top-4 right-4 z-50 max-w-[90vw] sm:max-w-sm cursor-pointer
      px-4 py-3 rounded-lg shadow-lg text-white animate-fade-in
      ${toast.type === 'success' ? 'bg-emerald-600' : ''}
      ${toast.type === 'warn' ? 'bg-amber-500' : ''}
      ${toast.type === 'error' ? 'bg-rose-600' : ''}
    `}
    role="status"
    aria-live="polite"
    title="クリックで閉じる"
  >
    <div className="flex items-start gap-3">
      <div className="pt-[2px]">{toast.msg}</div>
      {/* Xアイコンを出したい場合だけ表示（lucide-react の X を import しているなら） */}
      {/* <button
        aria-label="閉じる"
        onClick={(e) => { e.stopPropagation(); closeToast(); }}
        className="shrink-0 opacity-80 hover:opacity-100"
      >
        <X className="w-4 h-4" />
      </button> */}
    </div>
  </div>
)}
    </div>
  );
};

export default DietWorkoutTracker;
