type Fn<A extends readonly unknown[] = [], R = void> = (...arg: A) => R;

/**
 * トリガーへ関数の追加・削除のみさせるインターフェース
 */
export interface SetOnlyTrigger<T extends readonly unknown[] = []> {
  /**
   * 関数を登録します
   * @param fn 
   * @returns 削除するためのキー
   */
  add(fn: Fn<T, void>): number;
  /**
   * １度呼び出されて自動で削除される関数を登録します
   * @param fn 
   * @readonly 削除するためのキー
   */
  addOnce(fn: Fn<T, void>): void;
  /**
   * 関数を削除します
   * @param key 削除するためのキー 
   */
  remove(key: number): void;
}

/**
 * 関数を登録して、呼び出してもらうやつ
 * @template V データ型
 */
export class Trigger<V extends readonly unknown[] = []> implements SetOnlyTrigger<V> {
  private keyIndex = 1;
  private readonly funcSet = new Map<number, Fn<V, void>>();

  /**
   * セット専用トリガー版（型が違うだけで同一オブジェクト）
   */
  public readonly asSetOnlyTrigger: SetOnlyTrigger<V> = this;

  public add(fn: Fn<V, void>) {
    const key = this.keyIndex++;
    this.funcSet.set(key, fn);
    return key;
  }

  public addOnce(fn: Fn<V, void>) {
    const onceFn = (...args: V) => {
      fn(...args);
      this.remove(key);
    };
    const key = this.add(onceFn);
    return key;
  }

  public remove(key: number): void {
    this.funcSet.delete(key);
  }

  /**
   * セットされている関数を全て実行する
   * @param {V} args 実行する関数の引数
   */
  public fire(...args: V): void {
    this.funcSet.forEach(fn => fn(...args));
  }
}
