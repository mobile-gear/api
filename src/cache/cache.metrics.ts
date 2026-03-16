interface CacheStats {
  hits: number;
  misses: number;
  errors: number;
  hitRate: string;
  totalRequests: number;
}

class CacheMetrics {
  private hits = 0;
  private misses = 0;
  private errors = 0;

  recordHit(): void {
    this.hits++;
  }

  recordMiss(): void {
    this.misses++;
  }

  recordError(): void {
    this.errors++;
  }

  getStats(): CacheStats {
    const totalRequests = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      errors: this.errors,
      totalRequests,
      hitRate:
        totalRequests > 0
          ? `${((this.hits / totalRequests) * 100).toFixed(1)}%`
          : "0%",
    };
  }

  reset(): void {
    this.hits = 0;
    this.misses = 0;
    this.errors = 0;
  }
}

export default new CacheMetrics();
