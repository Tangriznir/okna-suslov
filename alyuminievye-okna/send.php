<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$to = 'sales@okna-suslov.ru';

$name   = trim(strip_tags($_POST['name']   ?? ''));
$phone  = trim(strip_tags($_POST['phone']  ?? ''));
$config = trim(strip_tags($_POST['config'] ?? ''));

if(!$name || !$phone){
    echo json_encode(['ok'=>false, 'error'=>'Не заполнены поля']);
    exit;
}

$subject = '=?UTF-8?B?'.base64_encode('Новая заявка на просчёт — Окна Суслов').'?=';

$body  = "Новая заявка с конфигуратора остекления\n";
$body .= "=========================================\n\n";
$body .= "Имя:     $name\n";
$body .= "Телефон: $phone\n\n";
$body .= "Конфигурация:\n";
$body .= "$config\n";

$headers  = "From: =?UTF-8?B?".base64_encode('Конфигуратор Окна Суслов')."?= <noreply@okna-suslov.ru>\r\n";
$headers .= "Reply-To: $phone\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "Content-Transfer-Encoding: base64\r\n";

$result = mail($to, $subject, base64_encode($body), $headers);

echo json_encode(['ok' => (bool)$result]);
