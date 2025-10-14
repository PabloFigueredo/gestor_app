import { Injectable } from '@angular/core';
import { createClient, RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

type EventType = 'INSERT' | 'UPDATE' | 'DELETE';
type PgChange<T = any> = {
  eventType: EventType;
  schema: string;
  table: string;
  new: T | null;
  old: T | null;
};

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private supabase!: SupabaseClient;
  private channel?: RealtimeChannel;

  private ensureClient() {
    if (!this.supabase) {
      this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
      console.log('[Realtime] Supabase client inicializado');
    }
  }

  subscribe(onLog?: (msg: string, data?: any) => void) {
    this.ensureClient();
    if (this.channel) return; // ya suscrito

    this.channel = this.supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task' }, (payload) => {
        const chg: PgChange = {
          eventType: payload.eventType as EventType,
          schema: payload.schema,
          table: payload.table,
          new: (payload as any).new ?? null,
          old: (payload as any).old ?? null
        };
        onLog?.('[Realtime] task cambio', chg);
        console.log('[Realtime] task', chg);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_comment' }, (payload) => {
        const chg: PgChange = {
          eventType: payload.eventType as EventType,
          schema: payload.schema,
          table: payload.table,
          new: (payload as any).new ?? null,
          old: (payload as any).old ?? null
        };
        onLog?.('[Realtime] comment cambio', chg);
        console.log('[Realtime] comment', chg);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_status_history' }, (payload) => {
        const chg: PgChange = {
          eventType: payload.eventType as EventType,
          schema: payload.schema,
          table: payload.table,
          new: (payload as any).new ?? null,
          old: (payload as any).old ?? null
        };
        onLog?.('[Realtime] status cambio', chg);
        console.log('[Realtime] status', chg);
      })
      .subscribe((status) => {
        console.log('[Realtime] channel status:', status);
      });
  }

  unsubscribe() {
    if (this.channel && this.supabase) {
      this.supabase.removeChannel(this.channel);
      this.channel = undefined;
      console.log('[Realtime] canal removido');
    }
  }
}