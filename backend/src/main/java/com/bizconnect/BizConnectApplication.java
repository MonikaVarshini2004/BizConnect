package com.bizconnect;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class BizConnectApplication {

    public static void main(String[] args) {
        SpringApplication.run(BizConnectApplication.class, args);
    }
}
