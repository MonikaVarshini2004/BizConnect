-- ====================================================================
-- BizConnect: Production MySQL Database Schema DDL
-- Compatible with MySQL 8.0+
-- ====================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(120) NOT NULL,
    role VARCHAR(20) NOT NULL,
    account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    last_login DATETIME,
    INDEX idx_users_role (role),
    INDEX idx_users_status (account_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    INDEX idx_categories_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. BUSINESS IDEAS TABLE
CREATE TABLE IF NOT EXISTS business_ideas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category_id BIGINT NOT NULL,
    short_description VARCHAR(500),
    detailed_description TEXT,
    investment_range VARCHAR(100),
    expected_profit VARCHAR(100),
    required_skills VARCHAR(255),
    risk_level VARCHAR(50),
    tags VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_by_user_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    CONSTRAINT fk_business_ideas_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE,
    CONSTRAINT fk_business_ideas_creator FOREIGN KEY (created_by_user_id) REFERENCES users (id) ON DELETE RESTRICT,
    INDEX idx_ideas_status (status),
    INDEX idx_ideas_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. VENDORS TABLE
CREATE TABLE IF NOT EXISTS vendors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    business_name VARCHAR(150) NOT NULL,
    owner_name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address VARCHAR(255),
    description TEXT,
    category_id BIGINT,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    vendor_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    verified_at DATETIME,
    rejection_reason TEXT,
    CONSTRAINT fk_vendors_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_vendors_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL,
    INDEX idx_vendors_verification (verification_status),
    INDEX idx_vendors_status (vendor_status),
    INDEX idx_vendors_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. PRODUCTS / SERVICES TABLE
CREATE TABLE IF NOT EXISTS products_services (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vendor_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    category_id BIGINT,
    description TEXT,
    price DECIMAL(12, 2),
    price_range VARCHAR(100),
    availability VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    CONSTRAINT fk_products_services_vendor FOREIGN KEY (vendor_id) REFERENCES vendors (id) ON DELETE CASCADE,
    CONSTRAINT fk_products_services_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL,
    INDEX idx_ps_status (status),
    INDEX idx_ps_vendor (vendor_id),
    INDEX idx_ps_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS inquiries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    vendor_id BIGINT NOT NULL,
    business_idea_id BIGINT,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    vendor_response TEXT,
    quoted_price DECIMAL(12, 2),
    delivery_information TEXT,
    created_at DATETIME NOT NULL,
    responded_at DATETIME,
    CONSTRAINT fk_inquiries_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_inquiries_vendor FOREIGN KEY (vendor_id) REFERENCES vendors (id) ON DELETE CASCADE,
    CONSTRAINT fk_inquiries_idea FOREIGN KEY (business_idea_id) REFERENCES business_ideas (id) ON DELETE SET NULL,
    INDEX idx_inquiries_user (user_id),
    INDEX idx_inquiries_vendor (vendor_id),
    INDEX idx_inquiries_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. JOB OPENINGS TABLE
CREATE TABLE IF NOT EXISTS job_openings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vendor_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    required_skills VARCHAR(255),
    location VARCHAR(100),
    openings INT DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    created_at DATETIME NOT NULL,
    closing_date DATE,
    CONSTRAINT fk_job_openings_vendor FOREIGN KEY (vendor_id) REFERENCES vendors (id) ON DELETE CASCADE,
    INDEX idx_jobs_status (status),
    INDEX idx_jobs_vendor (vendor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. JOB APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS job_applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_opening_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    application_message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'APPLIED',
    applied_at DATETIME NOT NULL,
    updated_at DATETIME,
    CONSTRAINT fk_job_applications_opening FOREIGN KEY (job_opening_id) REFERENCES job_openings (id) ON DELETE CASCADE,
    CONSTRAINT fk_job_applications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_applications_opening (job_opening_id),
    INDEX idx_applications_user (user_id),
    INDEX idx_applications_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. ADMIN AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admin_user_id BIGINT NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id BIGINT,
    description TEXT,
    timestamp DATETIME NOT NULL,
    CONSTRAINT fk_admin_audit_logs_admin FOREIGN KEY (admin_user_id) REFERENCES users (id) ON DELETE RESTRICT,
    INDEX idx_audit_admin (admin_user_id),
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
