package com.bank.fraud.repository;

import com.bank.fraud.model.FraudAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FraudAlertRepository extends JpaRepository<FraudAlert, String> {

    List<FraudAlert> findByUserIdOrderByCreatedAtDesc(String userId);

    List<FraudAlert> findByStatusOrderByCreatedAtDesc(String status);

    List<FraudAlert> findBySeverityOrderByCreatedAtDesc(com.bank.fraud.model.RiskLevel severity);
}
