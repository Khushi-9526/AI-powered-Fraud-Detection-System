package com.bank.fraud.repository;

import com.bank.fraud.model.Transaction;
import com.bank.fraud.model.TransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {

    List<Transaction> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Transaction> findByStatusOrderByCreatedAtDesc(TransactionStatus status);

    List<Transaction> findByIsFraudTrueOrderByCreatedAtDesc();

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.userId = :userId AND t.createdAt >= :since")
    int countRecentTransactionsForUser(@Param("userId") String userId, @Param("since") LocalDateTime since);

    @Query("SELECT t FROM Transaction t WHERE t.riskScore >= :minScore ORDER BY t.riskScore DESC")
    List<Transaction> findHighRiskTransactions(@Param("minScore") int minScore);
}
