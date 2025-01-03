"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import SiginReminder from "@/app/components/SigninReminder";
import Trademark from "@/app/components/Trademark";
import { useEffect, useRef, useState } from "react";
import DepartmentList from "@/app/components/DepartmentList";

function Departments() {
	const { data: session } = useSession();
	const [departmentName, setDepartmentName] = useState("");
	const [departmentDescription, setDepartmentDescription] = useState("");
	const [departmentLogo, setDepartmentLogo] = useState("");
	const [selectedFileName, setSelectedFileName] = useState("");
	const [currentUser, setCurrentUser] = useState(null);
	const [departmentList, setDepartmentList] = useState([]);

	useEffect(() => {
		async function getDepartments() {
			const res = await fetch(`/api/departments`);
			const data = await res.json();

			setDepartmentList(data.departments);
		}
		getDepartments();
	}, []);

	// lock scroll when modal is open
	const [isMdodalOpen, setIsModalOpen] = useState(false);
	useEffect(() => {
		if (isMdodalOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "auto";
		}
	}, [isMdodalOpen]);

	const createDepartmentHandle = async (e) => {
		e.preventDefault();
		const requestBody = {
			departmentName,
			departmentDescription,
			departmentLogo,
			userId: currentUser.id,
		};

		try {
			const res = await fetch(`/api/departments/department`, {
				method: "POST",
				headers: { "Content-type": "application/json" },
				body: JSON.stringify(requestBody),
			});
			if (res.ok) {
				const data = await res.json();
				setDepartmentList((prevList) => [...prevList, data?.newDepartment]);
				window.alert(data?.message);
			} else {
				const data = await res.json();
				window.alert(data?.message);
			}
		} catch (error) {
			console.log(error.message);
		}
		createDepartmentDialogRef.current.close();
		e.target.reset();
		setIsModalOpen(false);
	};

	const createDepartmentDialogRef = useRef(null);
	const createDepartmentFormRef = useRef(null);

	async function getUser() {
		const res = await fetch(`/api/users/user?useremail=${session?.user.email}`);
		const data = await res.json();
		setCurrentUser(data.user);
	}

	return (
		<>
			{session ? (
				<>
					<main>
						<div className="w-full sm:w-3/4 xl:w-1/2 mx-auto p-0 sm:p-4 bg-white">
							<section className="bg-gray-200 p-4 rounded">
								<h2 className="text-lg font-bold text-center p-2 bg-gray-300 rounded">
									<span className="material-symbols-outlined block mr-2 text-sky-600 size-32 align-bottom">
										groups
									</span>
									Departments
								</h2>
								<hr className="border-gray-400 my-4" />

								{/* create department form */}
								<button
									onClick={() => {
										getUser();
										createDepartmentDialogRef.current.showModal();
										setIsModalOpen(true);
									}}
									className="flex flex-row items-center gap-1 p-2 bg-gray-300 rounded w-full justify-center active:text-green-700"
								>
									<span className="material-symbols-outlined align-middle size-20 bg-green-600 text-neutral-200">
										add
									</span>
									<span>Create Department</span>
								</button>

								<dialog
									className="rounded border w-3/4 md:w-1/2 border-gray-700"
									ref={createDepartmentDialogRef}
								>
									<form
										ref={createDepartmentFormRef}
										onSubmit={createDepartmentHandle}
										className="flex flex-col items-center justify-center gap-2 p-4 "
									>
										<input
											onChange={(e) => {
												setDepartmentName(e.target.value);
											}}
											className="text-sm p-2 w-full  rounded bg-gray-300"
											type="text"
											placeholder="Department name"
											required
											maxLength={100}
										/>
										<textarea
											onChange={(e) => {
												setDepartmentDescription(e.target.value);
											}}
											className="text-sm p-2 w-full h-40 resize-none rounded bg-gray-300"
											type="text"
											placeholder="Department description"
											maxLength={420}
										/>
										<label htmlFor="selectlogo">Select Logo</label>
										<p>{selectedFileName}</p>
										<input
											id="selectlogo"
											onChange={(e) => {
												setSelectedFileName(e.target.files[0].name);
												const file = e.target.files[0];
												const reader = new FileReader();
												reader.onloadend = function () {
													const b64 = reader.result;

													setDepartmentLogo(b64);
												};
												reader.readAsDataURL(file);
											}}
											className="text-sm p-2 w-full  rounded bg-gray-300"
											type="file"
											accept="image/png, image/webp, image/jpeg, image/jpg"
											hidden
										/>
										<fieldset className="flex flex-row gap-2 items-center justify-center">
											<button
												onClick={() => {
													createDepartmentDialogRef.current.close();
													createDepartmentFormRef.current.reset();
													setIsModalOpen(false);
												}}
												type="button"
												className="p-2 bg-gray-300 rounded my-2 w-fit active:text-green-700"
											>
												Cancel
											</button>
											<button
												type="submit"
												className="flex flex-row items-center gap-1 p-2 rounded my-2 w-fit justify-center active:text-green-700 bg-green-500"
											>
												<span className="material-symbols-outlined align-middle size-20  bg-neutral-200">
													add
												</span>
												<span>Create</span>
											</button>
										</fieldset>
									</form>
								</dialog>
								{/* display all departments here */}
								<DepartmentList departmentList={departmentList} />
							</section>
						</div>
					</main>
					<footer className=" p-2 ">
						<nav className="flex flex-row flex-wrap gap-3 text-sm justify-center my-1 text-neutral-600">
							<Link
								href={"/"}
								className="hover:underline hover:text-neutral-800 active:text-neutral-950"
							>
								About
							</Link>
							<Link
								href={"/"}
								className="hover:underline hover:text-neutral-800 active:text-neutral-950"
							>
								Privacy Policy
							</Link>
							<Link
								href={"/"}
								className="hover:underline hover:text-neutral-800 active:text-neutral-950"
							>
								Get App
							</Link>
							<Link
								href={"/"}
								className="hover:underline hover:text-neutral-800 active:text-neutral-950"
							>
								Help Center
							</Link>
						</nav>
						<Trademark />
					</footer>
				</>
			) : (
				<SiginReminder />
			)}
		</>
	);
}

export default Departments;
