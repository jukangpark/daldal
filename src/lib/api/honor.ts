import { supabase } from "../supabase";
import type {
  HonorVote,
  HonorResult,
  CreateHonorVoteData,
  VoteCandidate,
} from "../types";

// 명예의 전당 투표 API
const honorVoteAPI = {
  // 투표 후보자 목록 가져오기 (자소설 작성한 사용자들)
  async getCandidates(): Promise<{ data: VoteCandidate[] | null; error: any }> {
    const { data, error } = await supabase
      .from("self_introductions")
      .select("user_id, user_name, user_gender, photos")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("투표 후보자 로드 오류:", error);
      return { data: null, error };
    }

    // 중복 제거 (같은 사용자의 최신 자소설만)
    const uniqueCandidates = data?.reduce(
      (acc: VoteCandidate[], intro: any) => {
        const existing = acc.find((c) => c.user_id === intro.user_id);
        if (!existing) {
          acc.push({
            user_id: intro.user_id,
            user_name: intro.user_name || "이름 없음",
            user_gender: intro.user_gender || "male",
            photos: intro.photos || [],
            profile_image: intro.photos?.[0] || undefined,
          });
        }
        return acc;
      },
      []
    );

    return { data: uniqueCandidates || [], error: null };
  },

  // 사용자의 투표 내역 가져오기
  async getUserVotes(
    monthYear: string
  ): Promise<{ data: HonorVote[] | null; error: any }> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("honor_votes")
      .select("*")
      .eq("voter_id", user.id)
      .eq("month_year", monthYear)
      .order("created_at", { ascending: false });

    return { data, error };
  },

  // 투표하기 (upsert 방식)
  async vote(
    voteData: CreateHonorVoteData
  ): Promise<{ data: HonorVote | null; error: any }> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // 자기 자신에게 투표하는지 확인
    if (user.id === voteData.target_id) {
      throw new Error("자기 자신에게는 투표할 수 없습니다.");
    }

    const insertData = {
      voter_id: user.id,
      target_id: voteData.target_id,
      category: voteData.category,
      month_year: voteData.month_year,
    };

    const { data, error } = await supabase
      .from("honor_votes")
      .upsert([insertData], {
        onConflict: "voter_id,category,month_year",
      })
      .select()
      .single();

    return { data, error };
  },

  // 투표 취소
  async cancelVote(
    category: string,
    monthYear: string
  ): Promise<{ error: any }> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("honor_votes")
      .delete()
      .eq("voter_id", user.id)
      .eq("category", category)
      .eq("month_year", monthYear);

    return { error };
  },

  // 월별 투표 결과 가져오기 (TOP 3)
  async getResults(
    category: string,
    monthYear: string
  ): Promise<{ data: HonorResult[] | null; error: any }> {
    const { data, error } = await supabase
      .from("honor_results")
      .select("*")
      .eq("category", category)
      .eq("month_year", monthYear)
      .order("vote_count", { ascending: false })
      .order("rank", { ascending: true })
      .limit(3);

    return { data, error };
  },

  // 모든 카테고리의 월별 결과 가져오기
  async getAllResults(
    monthYear: string
  ): Promise<{ data: HonorResult[] | null; error: any }> {
    const { data, error } = await supabase
      .from("honor_results")
      .select("*")
      .eq("month_year", monthYear)
      .order("category", { ascending: true })
      .order("vote_count", { ascending: false });

    return { data, error };
  },

  // 투표 집계 함수 (서버에서 실행)
  async calculateResults(monthYear: string): Promise<{ error: any }> {
    // 이 함수는 서버 사이드에서 실행되어야 하므로
    // 실제로는 Supabase Edge Function이나 서버 API에서 처리
    return { error: null };
  },

  // 실시간 투표 결과 집계 (클라이언트에서 실행)
  async getLiveResults(): Promise<{ data: HonorResult[] | null; error: any }> {
    try {
      // 1. 모든 투표 데이터 가져오기
      const { data: allVotes, error: voteError } = await supabase
        .from("honor_votes")
        .select("*");

      if (voteError) {
        console.error("투표 데이터 로드 오류:", voteError);
        return { data: null, error: voteError };
      }

      if (!allVotes || allVotes.length === 0) {
        return { data: [], error: null };
      }

      // 2. 투표 수 집계 (더 안전한 방법)
      const voteCounts = new Map<
        string,
        { targetId: string; category: string; count: number }
      >();
      allVotes?.forEach((vote: any) => {
        const key = `${vote.target_id}-${vote.category}`;
        const existing = voteCounts.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          voteCounts.set(key, {
            targetId: vote.target_id,
            category: vote.category,
            count: 1,
          });
        }
      });

      // 3. 사용자 정보 가져오기
      const targetIds = Array.from(
        new Set(allVotes?.map((v: any) => v.target_id) || [])
      );

      if (targetIds.length === 0) {
        return { data: [], error: null };
      }

      const { data: userData, error: userError } = await supabase
        .from("self_introductions")
        .select("*")
        .in("user_id", targetIds);

      if (userError) {
        console.error("사용자 정보 로드 오류:", userError);
        return { data: null, error: userError };
      }

      if (!userData || userData.length === 0) {
        return { data: [], error: null };
      }

      // 4. 결과 데이터 구성
      const results: HonorResult[] = [];
      const userMap = new Map(
        userData?.map((u) => [u.user_id, u.user_name]) || []
      );

      voteCounts.forEach((voteData, key) => {
        const { targetId, category, count } = voteData;

        const userName = userMap.get(targetId);

        if (userName) {
          const result = {
            id: `${targetId}-${category}-2025-07`,
            user_id: targetId,
            user_name: userName,
            category: category as any,
            month_year: "2025-07",
            vote_count: count,
            rank: null, // 순위는 나중에 계산
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          results.push(result);
        } else {
        }
      });

      // 5. 카테고리별로 순위 계산
      const categories = [
        "hot_girl",
        "hot_boy",
        "manner",
        "sexy",
        "cute",
        "style",
      ];

      categories.forEach((category) => {
        const categoryResults = results.filter((r) => r.category === category);
        categoryResults
          .sort((a, b) => b.vote_count - a.vote_count)
          .forEach((result, index) => {
            result.rank = index + 1;
          });
      });

      return { data: results, error: null };
    } catch (error) {
      console.error("실시간 결과 집계 오류:", error);
      return { data: null, error };
    }
  },

  // 특정 카테고리의 실시간 결과 가져오기
  async getLiveResultsByCategory(
    category: string,
    monthYear: string
  ): Promise<{ data: HonorResult[] | null; error: any }> {
    try {
      const { data: votes, error: voteError } = await supabase
        .from("honor_votes")
        .select("target_id")
        .eq("month_year", monthYear)
        .eq("category", category);

      if (voteError) {
        console.error("투표 데이터 로드 오류:", voteError);
        return { data: null, error: voteError };
      }

      if (!votes || votes.length === 0) {
        return { data: [], error: null };
      }

      // 투표 수 집계
      const voteCounts = new Map<string, number>();
      votes.forEach((vote: any) => {
        voteCounts.set(
          vote.target_id,
          (voteCounts.get(vote.target_id) || 0) + 1
        );
      });

      // 사용자 정보 가져오기
      const targetIds = Array.from(voteCounts.keys());
      const { data: userData, error: userError } = await supabase
        .from("self_introductions")
        .select("user_id, user_name")
        .in("user_id", targetIds);

      if (userError) {
        console.error("사용자 정보 로드 오류:", userError);
        return { data: null, error: userError };
      }

      // 결과 데이터 구성 및 순위 계산
      const userMap = new Map(
        userData?.map((u) => [u.user_id, u.user_name]) || []
      );
      const results: HonorResult[] = Array.from(voteCounts.entries())
        .map(([targetId, count]) => {
          const userName = userMap.get(targetId);
          if (!userName) return null;

          return {
            id: `${targetId}-${category}-${monthYear}`,
            user_id: targetId,
            user_name: userName,
            category: category as any,
            month_year: monthYear,
            vote_count: count,
            rank: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        })
        .filter(Boolean) as HonorResult[];

      // 순위 계산
      results
        .sort((a, b) => b.vote_count - a.vote_count)
        .forEach((result, index) => {
          result.rank = index + 1;
        });

      return { data: results, error: null };
    } catch (error) {
      console.error("카테고리별 실시간 결과 집계 오류:", error);
      return { data: null, error };
    }
  },
};

export default honorVoteAPI;
