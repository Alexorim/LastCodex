import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private countdownStrSubject = new BehaviorSubject<string>('');
  private remainingSecondsSubject = new BehaviorSubject<number>(0);
  private dayResetSubject = new Subject<void>();

  countdownStr$: Observable<string> = this.countdownStrSubject.asObservable();
  remainingSeconds$: Observable<number> = this.remainingSecondsSubject.asObservable();
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
      
      // If we crossed midnight UTC, the remaining seconds will jump from ~0 to ~86400
      if (prevSeconds < 5 && newSeconds > 86000) {
        this.dayResetSubject.next();
      }
    });
  }

  private updateTime(): void {
    const now = new Date();
    const nextMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    const diffSeconds = Math.max(0, Math.floor((nextMidnight.getTime() - now.getTime()) / 1000));

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
  }

  isInStaleWindow(): boolean {
    const now = new Date();
    const minutesSinceMidnight = (now.getTime() - Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())) / 60000;
    return minutesSinceMidnight >= 0 && minutesSinceMidnight < 10;
  }
}
