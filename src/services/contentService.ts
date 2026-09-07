import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Stage, Challenge } from '../types';
import { STAGES_DATA } from '../data/challenges';

export const contentService = {
  /**
   * Fetch all active stages and their dynamic challenges from the database.
   * If database is unconfigured or offline, falls back to local data.
   */
  async getStages(): Promise<Stage[]> {
    if (!isSupabaseConfigured || !supabase) {
      return STAGES_DATA;
    }

    try {
      // 1. Query stages
      const { data: stagesData, error: stagesError } = await supabase
        .from('stages')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (stagesError || !stagesData || stagesData.length === 0) {
        console.warn('Could not fetch stages from Supabase, using local fallback:', stagesError);
        return STAGES_DATA;
      }

      // 2. Query challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_published', true)
        .order('order_index', { ascending: true });

      if (challengesError || !challengesData) {
        console.warn('Could not fetch challenges from Supabase:', challengesError);
        return STAGES_DATA;
      }

      // 3. Assemble dynamic schema
      return stagesData.map((s: any, idx: number) => {
        const stageChallenges: Challenge[] = challengesData
          .filter((c: any) => c.stage_id === s.id)
          .map((c: any) => {
            const payload = c.game_payload || {};
            return {
              id: c.id,
              stageId: c.stage_id,
              title: c.title,
              type: c.type,
              language: c.language || 'javascript',
              prompt: c.prompt,
              starterCode: c.starter_code,
              codeSnippet: c.starter_code,
              options: payload.options,
              correctIndex: payload.correct_index,
              expectedOutput: payload.expected_output,
              explanation: payload.explanation || '',
              xpReward: c.xp_reward || 50,
              entryFunction: payload.entry_function,
              testCases: payload.test_cases
            };
          });

        return {
          id: s.id,
          index: s.index_label || `0${idx + 1}`,
          slug: s.slug,
          name: s.name,
          state: idx === 0 ? 'Completed' : idx === 1 ? 'Completed' : idx === 2 ? 'In progress' : 'Locked',
          description: s.description,
          isPremium: s.is_premium || false,
          challenges: stageChallenges
        };
      });
    } catch (err) {
      console.error('Error in contentService.getStages:', err);
      return STAGES_DATA;
    }
  },

  /**
   * Save completed challenge to database if user is authenticated
   */
  async recordUserProgress(userId: string, challengeId: string, score: number = 100): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      await supabase.from('user_progress').upsert({
        user_id: userId,
        challenge_id: challengeId,
        score,
        completed_at: new Date().toISOString()
      }, { onConflict: 'user_id,challenge_id' });
    } catch (err) {
      console.error('Failed to record progress in Supabase:', err);
    }
  }
};
