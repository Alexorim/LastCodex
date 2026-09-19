import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private countdownStrSubject = new BehaviorSubject<string>('');
  private remainingSecondsSubject = new BehaviorSubject<number>(0);
  private localResetTimeSubject = new BehaviorSubject<string>('');
  private dayResetSubject = new Subject<void>();

  countdownStr$: Observable<string> = this.countdownStrSubject.asObservable();
  remainingSeconds$: Observable<number> = this.remainingSecondsSubject.asObservable();
  localResetTime$: Observable<string> = this.localResetTimeSubject.asObservable();
  dayReset$: Observable<void> = this.dayResetSubject.asObservable();

  constructor() {
    this.startTimer();
  }

  private startTimer(): void {
    this.updateTime();
    interval(1000).subscribe(() => {
      const prevSeconds = this.remainingSecondsSubject.value;
      this.updateTime();
      const newSeconds = this.remainingSecondsSubject.value;

      // When countdown wraps around from ~0 to ~86400, a reset just occurred
      if (prevSeconds < 3 && newSeconds > 86000) {
        this.dayResetSubject.next();
      }
    });
  }

  private updateTime(): void {
    const now = new Date();

    // Orna daily shop reset occurs globally at 04:00:00 UTC (11:00 PM / 23:00 in UTC-5)
    let target = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 4, 0, 0, 0));
    if (now.getTime() >= target.getTime()) {
      target = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 4, 0, 0, 0));
    }

    const diffSeconds = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
    this.remainingSecondsSubject.next(diffSeconds);

    const h = Math.floor(diffSeconds / 3600);
    const m = Math.floor((diffSeconds % 3600) / 60);
    const s = diffSeconds % 60;

    const formatted = [
      h.toString().padStart(2, '0'),
      m.toString().padStart(2, '0'),
      s.toString().padStart(2, '0')
    ].join(':');

    this.countdownStrSubject.next(formatted);

    // Format local reset time according to user's device
    try {
      const timeStr = target.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      this.localResetTimeSubject.next(timeStr);
    } catch {
      this.localResetTimeSubject.next('11:00 PM');
    }
  }

  isInStaleWindow(): boolean {
    const now = new Date();
    // Check if within 10 minutes past the 04:00 UTC mark
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();
    return currentHour === 4 && currentMinute < 10;
  }
}
