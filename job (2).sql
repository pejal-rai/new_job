-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 24, 2025 at 10:25 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `job`
--

-- --------------------------------------------------------

--
-- Table structure for table `applications`
--

CREATE TABLE `applications` (
  `id` bigint(20) NOT NULL,
  `name` varchar(225) NOT NULL,
  `email` varchar(225) NOT NULL,
  `resume` varchar(225) DEFAULT NULL,
  `status` varchar(225) NOT NULL DEFAULT 'pending',
  `schedule_datetime` datetime DEFAULT NULL,
  `meet_link` varchar(225) DEFAULT NULL,
  `work_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `applications`
--

INSERT INTO `applications` (`id`, `name`, `email`, `resume`, `status`, `schedule_datetime`, `meet_link`, `work_id`, `user_id`, `created_at`) VALUES
(11, 'pejal', 'pejal@gmail.com', '/uploads/1743669267268.pdf', 'pending', '0000-00-00 00:00:00', '', 16, 16, '2025-04-03 14:19:27'),
(24, 'we', 'we@gmail.com', '/uploads/1743753320943.pdf', 'pending', '2025-04-04 00:00:00', '', 17, 5, '2025-04-04 13:40:20'),
(34, 'df', 'fsdf@gmail.com', NULL, 'pending', '2025-04-05 00:00:00', '', 16, 20, '2025-04-05 17:36:22'),
(35, 'f', 'f@gmail.com', '/uploads/1744102035052.pdf', 'pending', NULL, NULL, 15, 5, '2025-04-08 14:32:15'),
(37, 'dfs', 'sd@gmail.com', '/uploads/1744102677492.pdf', 'approved', '2025-04-08 00:00:00', 'https://meet.google.com/pwa-cjzv-yex', 21, 5, '2025-04-08 14:42:57'),
(38, 'fghn', 'xfvc@gmail.cpm', '/uploads/1744130299285.pdf', 'pending', NULL, NULL, 19, 5, '2025-04-08 22:23:19'),
(39, 'sdf', 'dfs@gmail.com', NULL, 'pending', NULL, NULL, 20, 5, '2025-04-08 23:56:26'),
(40, 'pejal', 'user@gmail.com', '/uploads/1744272144298.pdf', 'approved', '2025-04-10 00:00:00', 'https://meet.google.com/eop-bxbh-iro', 22, 37, '2025-04-10 13:47:24'),
(41, 'regdf', 'gsdfd@gmail.com', NULL, 'approved', '2025-04-27 00:00:00', 'https://meet.google.com/xqs-jksd-qpz', 25, 39, '2025-04-21 14:28:48'),
(44, 'fs', 'ergf@gmail.com', NULL, 'pending', NULL, NULL, 26, 37, '2025-04-22 14:57:29'),
(45, 'vf', '324@gmail.com', '/ uploads / cvs / 1745393575350.pdf ', 'pending', NULL, NULL, 24, 37, '2025-04-23 13:17:55'),
(46, 'rgef', 'fd@gmail.com', '/ uploads / cvs / 1745393692401.pdf ', 'pending', NULL, NULL, 25, 37, '2025-04-23 13:19:52'),
(47, 'dfg', 'hr@gmail.com', NULL, 'pending', NULL, NULL, 34, 37, '2025-04-23 13:26:28'),
(48, 'fsg', 'nrbgf@gmail.com', '/ uploads / cvs / 1745396916700.pdf ', 'pending', NULL, NULL, 37, 37, '2025-04-23 14:13:36');

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `id` bigint(20) NOT NULL,
  `company_name` varchar(225) NOT NULL,
  `address` varchar(225) NOT NULL,
  `logo` varchar(225) DEFAULT NULL,
  `status` varchar(225) NOT NULL DEFAULT 'pending',
  `pan_no` varchar(225) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `companies`
--

INSERT INTO `companies` (`id`, `company_name`, `address`, `logo`, `status`, `pan_no`, `user_id`, `created_at`) VALUES
(63, 'Code it', 'Dhanra-17', '/uploads/1745394269862.png', 'approved', '2543', 39, '2025-04-23 13:29:29');

-- --------------------------------------------------------

--
-- Table structure for table `cvs`
--

CREATE TABLE `cvs` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `name` varchar(225) NOT NULL,
  `email` varchar(225) NOT NULL,
  `phone` varchar(225) NOT NULL,
  `pdf_path` varbinary(225) NOT NULL,
  `education` text NOT NULL,
  `experience` text NOT NULL,
  `skills` text NOT NULL,
  `photo_path` varchar(225) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cvs`
--

INSERT INTO `cvs` (`id`, `user_id`, `name`, `email`, `phone`, `pdf_path`, `education`, `experience`, `skills`, `photo_path`, `created_at`) VALUES
(8, 5, 'user', 'user@gmail.com', '3546356', 0x2f75706c6f6164732f6376732f355f63762e706466, '<ul><li>12 pass in computer science</li><li>fullstack and laravel certificate</li></ul>', '<p>1.5 year of coding expirence</p>', '<ul><li>frontend developer</li><li>backend developer</li><li>api dwsfsd fds</li></ul><p><br></p>', '', '2025-04-07 11:09:18'),
(11, 37, 'user', 'newsonrai963@gmail.com', '345', 0x2f75706c6f6164732f6376732f33375f63762e706466, '<p>dfew</p>', '<p>vrtgf</p>', '<p>wqevx</p>', '/uploads/cvs/37_photo.png', '2025-04-22 12:30:29'),
(12, 39, 'employer', 'sudamshrestha939@gmail.com', '6545', 0x2f75706c6f6164732f6376732f33395f63762e706466, '<p>hfg</p>', '<p>yrtfg</p>', '<p>erf</p>', '/uploads/cvs/39_photo.png', '2025-04-24 13:14:58');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `work_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `sender_id`, `work_id`, `message`, `created_at`) VALUES
(31, 37, 24, 'hlo', '2025-04-21 08:49:32'),
(32, 37, 25, 'hlo', '2025-04-21 08:49:49'),
(33, 39, 25, 'hlo', '2025-04-21 08:50:00'),
(34, 39, 25, 'ok', '2025-04-22 06:24:52'),
(35, 37, 25, 'what', '2025-04-22 06:24:59'),
(36, 37, 24, 'where', '2025-04-22 07:23:37'),
(37, 37, 24, 'wfd', '2025-04-22 07:24:17'),
(38, 37, 26, '?', '2025-04-22 07:24:38'),
(39, 37, 25, 'ds', '2025-04-22 07:25:11'),
(40, 37, 26, 'e', '2025-04-22 07:25:26'),
(41, 37, 25, 's', '2025-04-22 07:26:41'),
(42, 37, 26, 'where', '2025-04-22 07:33:22'),
(43, 39, 26, 'dsf', '2025-04-22 07:37:58'),
(44, 37, 26, 'ds', '2025-04-22 07:39:44'),
(45, 39, 26, 'yo', '2025-04-22 07:40:01'),
(46, 39, 25, 'ha', '2025-04-22 07:40:19'),
(47, 39, 26, 'ok', '2025-04-22 07:44:15'),
(48, 39, 25, 'wehre', '2025-04-22 07:44:18'),
(49, 37, 25, '?', '2025-04-22 07:44:46'),
(50, 39, 25, 'me', '2025-04-22 07:44:52'),
(51, 39, 26, 'sd', '2025-04-22 07:44:56'),
(52, 37, 26, 'dse', '2025-04-22 07:45:05');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `name` varchar(225) NOT NULL,
  `email` varchar(225) NOT NULL,
  `phone` varchar(225) NOT NULL,
  `password` varchar(225) NOT NULL,
  `role` varchar(225) NOT NULL DEFAULT 'user',
  `verification_code` varchar(6) DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `profile_image` varchar(225) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password`, `role`, `verification_code`, `is_verified`, `profile_image`, `created_at`) VALUES
(36, 'admin', 'freshsouls69@gmail.com', '', 'sha1$93c1699f$1$a34b411ed3e4b206da90b9b9beda582e6d573065', 'admin', NULL, 1, NULL, '2025-04-09 13:44:00'),
(37, 'user', 'newsonrai963@gmail.com', '', 'sha1$9de3ddc4$1$ef1f7368ff98a51de1f8cfe0d71b14cd0a021567', 'user', NULL, 1, '/uploads/1745219566158.jpg', '2025-04-10 13:25:52'),
(39, 'employer', 'sudamshrestha939@gmail.com', '', 'sha1$f6d9ee9e$1$8d866d3cd19264f61c49c47d82362d00d9328d32', 'employer', NULL, 1, '/uploads/1745219837113.jpg', '2025-04-10 13:39:14'),
(41, 'next', 'mnsprai@gmail.com', '', 'sha1$dbb4da8b$1$55801945025e39009f1b216b6a5ccb67dab81b47', 'user', NULL, 1, NULL, '2025-04-12 09:21:54'),
(42, 'okok', 'raipejal123@gmail.com', '', 'sha1$38fdddf2$1$df22d25eeb211641d8c409f7307ab3e5722d3adc', 'user', NULL, 1, NULL, '2025-04-21 13:14:33');

-- --------------------------------------------------------

--
-- Table structure for table `works`
--

CREATE TABLE `works` (
  `id` bigint(20) NOT NULL,
  `title` varchar(225) NOT NULL,
  `position` varchar(225) NOT NULL,
  `salary` varchar(225) NOT NULL,
  `requirement` text NOT NULL,
  `description` text NOT NULL,
  `image` varchar(225) DEFAULT NULL,
  `apply_date` varchar(225) NOT NULL,
  `end_date` date NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `companies_id` bigint(20) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `works`
--

INSERT INTO `works` (`id`, `title`, `position`, `salary`, `requirement`, `description`, `image`, `apply_date`, `end_date`, `user_id`, `companies_id`, `created_at`) VALUES
(24, 'CMREC-1020 Senior Full Stack Developer :', 'Senior', '25000', '<ul><li>Proficiency in TypeScript is a must.</li><li>Strong experience with Node.js for server-side development.</li><li>Expertise in React for front-end development.</li><li>Experience with Amazon Web Services (AWS) for cloud infrastructure.</li></ul><p><br></p>', '<p><br></p><ul><li>Design, develop, and maintain scalable full-stack applications using modern technologies.</li><li>Collaborate with cross-functional teams to define, design, and deliver new features.</li><li>Build and maintain cloud-based infrastructure, ensuring high availability and performance.</li></ul>', '/uploads/1744431478022.png', '2025-04-12', '2025-05-09', 41, 46, '2025-04-12 10:02:58'),
(37, 'fd', 'bd23', '2345', '<p>ggf</p>', '<p>rewf</p>', '/uploads/1745396868381.png', '2025-04-23', '2025-05-02', 39, 63, '2025-04-23 14:12:48');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `applications`
--
ALTER TABLE `applications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cvs`
--
ALTER TABLE `cvs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `works`
--
ALTER TABLE `works`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `applications`
--
ALTER TABLE `applications`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT for table `cvs`
--
ALTER TABLE `cvs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `works`
--
ALTER TABLE `works`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
