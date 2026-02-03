-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 03, 2026 at 08:07 AM
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
-- Database: `civic_hub`
--

-- --------------------------------------------------------

--
-- Table structure for table `issues`
--

CREATE TABLE `issues` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `location` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Open',
  `upvotes` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `issues`
--

INSERT INTO `issues` (`id`, `user_id`, `title`, `category`, `location`, `description`, `image_path`, `status`, `upvotes`, `created_at`) VALUES
(1, 1, 'Many potholes near patto Panjim', 'Roads', 'Panjim Goa', 'Fix them immediately as they are causing huge traffic ', '/uploads/issue-1768780894310-122688019.png', 'In Progress', 1, '2026-01-19 00:01:34'),
(2, 1, 'One big pothole Near Margao market', 'Roads', 'Margao Goa', 'Fix this pothole immediately ', '/uploads/issue-1768781954987-940045383.png', 'Resolved', 1, '2026-01-19 00:19:14'),
(3, 3, 'Potholes in Fatorda ', 'Roads', 'Margao Goa', 'Fix ASAP', '/uploads/issue-1768783228199-152537532.png', 'Resolved', 2, '2026-01-19 00:40:28'),
(4, 1, 'Pipeline leakage ', 'Water', 'Panjim Goa', 'Solve it', '/uploads/issue-1768783664781-236178985.png', 'In Progress', 0, '2026-01-19 00:47:44');

-- --------------------------------------------------------

--
-- Table structure for table `issue_upvotes`
--

CREATE TABLE `issue_upvotes` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `issue_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `issue_upvotes`
--

INSERT INTO `issue_upvotes` (`id`, `user_id`, `issue_id`, `created_at`) VALUES
(4, 1, 2, '2026-01-19 00:19:24'),
(5, 1, 1, '2026-01-19 00:35:23'),
(6, 3, 3, '2026-01-19 00:40:32'),
(7, 1, 3, '2026-01-19 00:40:51');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'citizen',
  `department` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `role`, `department`, `created_at`) VALUES
(1, 'vicky', 'vicky@gmail.com', '$2b$10$yvPcUPPKplbbqFq6cx.ZtOCdAPwWCp4KfJhnSn/jB5.cWhnOI541a', 'citizen', NULL, '2026-01-18 23:59:16'),
(2, 'royston', 'royston@gmail.com', '$2b$10$T/HWlAROgb8aVCAgsWH.XePbgxaCB9P0MZP9Jr0HXSdBEJoENt7mW', 'staff', 'Roads ', '2026-01-19 00:02:31'),
(3, 'sahil ', 'sahil@gmail.com', '$2b$10$pqpNhU9.m1x6TjvF8uHQWOsIQ4LDLVAhEO4aJWPAug/pKXo3lq5Ky', 'citizen', NULL, '2026-01-19 00:39:13'),
(4, 'Mayur', 'mayur@gmail.com', '$2b$10$LTFOZJHCbvnueJ704leM2uxAtGTg9pcf7u4pM4bF87Jd02xYe1HnK', 'staff', 'water', '2026-01-19 00:45:40');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `issues`
--
ALTER TABLE `issues`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `issue_upvotes`
--
ALTER TABLE `issue_upvotes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_vote` (`user_id`,`issue_id`),
  ADD KEY `issue_id` (`issue_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `issues`
--
ALTER TABLE `issues`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `issue_upvotes`
--
ALTER TABLE `issue_upvotes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `issues`
--
ALTER TABLE `issues`
  ADD CONSTRAINT `issues_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `issue_upvotes`
--
ALTER TABLE `issue_upvotes`
  ADD CONSTRAINT `issue_upvotes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `issue_upvotes_ibfk_2` FOREIGN KEY (`issue_id`) REFERENCES `issues` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
